import { Request, Response } from 'express';
import neo4j from 'neo4j-driver';
import { getNeo4jSession, neo4jToPlain } from '../config/neo4j.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const categoryId = req.query.category as string;
    const search = req.query.search as string;

    const params: Record<string, any> = {
      skip: neo4j.int(skip),
      limit: neo4j.int(limit),
    };

    let matchClause: string;
    let whereClauses: string[] = [];

    if (categoryId) {
      matchClause = 'MATCH (p:Product)-[:BELONGS_TO]->(cat:Category {id: $categoryId})';
      params.categoryId = categoryId;
    } else {
      matchClause = 'MATCH (p:Product) OPTIONAL MATCH (p)-[:BELONGS_TO]->(cat:Category)';
    }

    if (search) {
      whereClauses.push('toLower(p.name) CONTAINS toLower($search)');
      params.search = search;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countCypher = `
      ${matchClause}
      ${whereStr}
      RETURN count(p) AS total
    `;

    const dataCypher = `
      ${matchClause}
      ${whereStr}
      RETURN p {
        .*,
        categoryName: cat.name,
        categoryId: cat.id
      } AS product
      ORDER BY p.soldCount DESC, p.rating DESC
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
    `;

    const countResult = await session.run(countCypher, params);
    const total = neo4jToPlain(countResult.records[0]?.get('total')) || 0;

    const dataResult = await session.run(dataCypher, params);
    const products = dataResult.records.map((r) => neo4jToPlain(r.get('product')));

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { id } = req.params;
    const cypher = `
      MATCH (p:Product {id: $id})
      OPTIONAL MATCH (p)-[:BELONGS_TO]->(cat:Category)
      OPTIONAL MATCH (p)<-[rb:BOUGHT]-(:Customer)
      OPTIONAL MATCH (p)<-[rv:VIEWED]-(:Customer)
      WITH p, cat, count(DISTINCT rb) AS totalPurchases, count(DISTINCT rv) AS totalViews
      RETURN p {
        .*,
        categoryName: cat.name,
        categoryId: cat.id,
        totalPurchases: totalPurchases,
        totalViews: totalViews
      } AS product
    `;

    const result = await session.run(cypher, { id });
    if (result.records.length === 0) {
      res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
      return;
    }

    const product = neo4jToPlain(result.records[0].get('product'));
    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Error fetching product by id:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { id, name, price, originalPrice, discountPercent, imageUrl, rating, categoryId, description } = req.body;

    if (!id || !name || !price || !categoryId) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: id, name, price, categoryId' });
      return;
    }

    const cypher = `
      MATCH (cat:Category {id: $categoryId})
      MERGE (p:Product {id: $id})
      SET p.name = $name,
          p.price = toFloat($price),
          p.originalPrice = toFloat($originalPrice),
          p.discountPercent = toInteger($discountPercent),
          p.imageUrl = $imageUrl,
          p.rating = toFloat($rating),
          p.soldCount = 0,
          p.description = $description,
          p.createdAt = datetime().epochMillis
      MERGE (p)-[:BELONGS_TO]->(cat)
      RETURN p, cat.name AS categoryName
    `;

    const result = await session.run(cypher, {
      id,
      name,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      discountPercent: Number(discountPercent || 0),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      rating: Number(rating || 5.0),
      categoryId,
      description: description || '',
    });

    if (result.records.length === 0) {
      res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: neo4jToPlain(result.records[0].get('p')),
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { id } = req.params;
    const { name, price, originalPrice, discountPercent, imageUrl, rating, description, categoryId } = req.body;

    let cypher = `
      MATCH (p:Product {id: $id})
      SET p.name = coalesce($name, p.name),
          p.price = coalesce(toFloat($price), p.price),
          p.originalPrice = coalesce(toFloat($originalPrice), p.originalPrice),
          p.discountPercent = coalesce(toInteger($discountPercent), p.discountPercent),
          p.imageUrl = coalesce($imageUrl, p.imageUrl),
          p.rating = coalesce(toFloat($rating), p.rating),
          p.description = coalesce($description, p.description),
          p.updatedAt = datetime().epochMillis
    `;

    if (categoryId) {
      cypher += `
        WITH p
        MATCH (newCat:Category {id: $categoryId})
        OPTIONAL MATCH (p)-[oldR:BELONGS_TO]->(:Category)
        DELETE oldR
        MERGE (p)-[:BELONGS_TO]->(newCat)
      `;
    }

    cypher += ` RETURN p`;

    const result = await session.run(cypher, {
      id,
      name: name ?? null,
      price: price !== undefined ? Number(price) : null,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : null,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : null,
      imageUrl: imageUrl ?? null,
      rating: rating !== undefined ? Number(rating) : null,
      description: description ?? null,
      categoryId: categoryId ?? null,
    });

    if (result.records.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
      return;
    }

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: neo4jToPlain(result.records[0].get('p')),
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { id } = req.params;
    const cypher = `
      MATCH (p:Product {id: $id})
      DETACH DELETE p
      RETURN count(p) AS deletedCount
    `;

    const result = await session.run(cypher, { id });
    const deletedCount = neo4jToPlain(result.records[0].get('deletedCount'));

    if (deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' });
      return;
    }

    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const cypher = `
      MATCH (cat:Category)
      OPTIONAL MATCH (cat)<-[:BELONGS_TO]-(p:Product)
      RETURN cat.id AS id,
             cat.name AS name,
             cat.icon AS icon,
             count(p) AS productCount
      ORDER BY cat.name ASC
    `;

    const result = await session.run(cypher);
    const categories = result.records.map((r) => ({
      id: r.get('id'),
      name: r.get('name'),
      icon: r.get('icon'),
      productCount: neo4jToPlain(r.get('productCount')),
    }));

    res.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};
