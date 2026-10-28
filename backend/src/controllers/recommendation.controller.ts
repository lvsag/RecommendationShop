import { Request, Response } from 'express';
import neo4j from 'neo4j-driver';
import { getNeo4jSession, neo4jToPlain } from '../config/neo4j.js';

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { customerId } = req.params;
    const limit = Math.max(1, Math.min(20, parseInt(req.query.limit as string) || 10));

    if (!customerId) {
      res.status(400).json({ success: false, message: 'Thiếu customerId' });
      return;
    }

    // 1. Kiểm tra sự tồn tại của Customer
    const checkCustomerCypher = `MATCH (c:Customer {id: $customerId}) RETURN c.name AS name`;
    const checkResult = await session.run(checkCustomerCypher, { customerId });
    if (checkResult.records.length === 0) {
      res.status(404).json({ success: false, message: `Khách hàng ID ${customerId} không tồn tại` });
      return;
    }
    const customerName = checkResult.records[0].get('name');

    // 2. Thuật toán Collaborative Filtering bằng Cypher
    // Path: (c1)-[:BOUGHT|VIEWED]->(p1)<-[:BOUGHT|VIEWED]-(c2)-[r2:BOUGHT|VIEWED]->(p2)
    // Loại trừ các sản phẩm mà c1 ĐÃ MUA (còn xem thì vẫn gợi ý)
    const collaborativeFilteringCypher = `
      MATCH (c1:Customer {id: $customerId})
      MATCH (c1)-[r1:BOUGHT|VIEWED]->(p1:Product)
      MATCH (p1)<-[r_shared:BOUGHT|VIEWED]-(c2:Customer)
      WHERE c2.id <> c1.id
      MATCH (c2)-[r2:BOUGHT|VIEWED]->(p2:Product)
      WHERE p2.id <> p1.id
        AND NOT (c1)-[:BOUGHT]->(p2)
      WITH p2,
           count(DISTINCT CASE WHEN type(r2) = 'BOUGHT' THEN c2 END) AS coBoughtCount,
           count(DISTINCT CASE WHEN type(r2) = 'VIEWED' THEN c2 END) AS coViewedCount,
           count(DISTINCT c2) AS totalCoCustomers
      WITH p2, coBoughtCount, coViewedCount, totalCoCustomers,
           round((coBoughtCount * 3.0 + coViewedCount * 1.0), 2) AS recommendationScore
      OPTIONAL MATCH (p2)-[:BELONGS_TO]->(cat:Category)
      RETURN p2.id AS id,
             p2.name AS name,
             p2.price AS price,
             p2.originalPrice AS originalPrice,
             p2.discountPercent AS discountPercent,
             p2.imageUrl AS imageUrl,
             p2.rating AS rating,
             p2.soldCount AS soldCount,
             cat.name AS categoryName,
             recommendationScore AS score,
             coBoughtCount,
             coViewedCount,
             totalCoCustomers,
             CASE
               WHEN coBoughtCount > 0 AND coViewedCount > 0 THEN
                 "Khách mua cùng cũng đã mua (" + toString(coBoughtCount) + ") & xem (" + toString(coViewedCount) + ")"
               WHEN coBoughtCount > 0 THEN
                 "Được " + toString(coBoughtCount) + " khách hàng mua cùng sở thích đã mua"
               ELSE
                 "Được " + toString(coViewedCount) + " khách hàng có cùng gu quan tâm"
             END AS reason
      ORDER BY recommendationScore DESC, p2.soldCount DESC, p2.rating DESC
      LIMIT toInteger($limit)
    `;

    const cfResult = await session.run(collaborativeFilteringCypher, {
      customerId,
      limit: neo4j.int(limit),
    });

    let recommendations: any[] = [];
    let strategy = 'collaborative_filtering';

    if (cfResult.records.length > 0) {
      recommendations = cfResult.records.map((r) => ({
        id: r.get('id'),
        name: r.get('name'),
        price: neo4jToPlain(r.get('price')),
        originalPrice: neo4jToPlain(r.get('originalPrice')),
        discountPercent: neo4jToPlain(r.get('discountPercent')),
        imageUrl: r.get('imageUrl'),
        rating: neo4jToPlain(r.get('rating')),
        soldCount: neo4jToPlain(r.get('soldCount')),
        categoryName: r.get('categoryName'),
        score: neo4jToPlain(r.get('score')),
        coBoughtCount: neo4jToPlain(r.get('coBoughtCount')),
        coViewedCount: neo4jToPlain(r.get('coViewedCount')),
        totalCoCustomers: neo4jToPlain(r.get('totalCoCustomers')),
        reason: r.get('reason'),
      }));
    } else {
      // 3. Fallback: Lấy Top sản phẩm bán chạy nhất toàn sàn cho khách hàng mới
      strategy = 'cold_start_fallback';
      const coldStartCypher = `
        MATCH (p:Product)
        OPTIONAL MATCH (p)<-[r:BOUGHT]-(c:Customer)
        OPTIONAL MATCH (p)-[:BELONGS_TO]->(cat:Category)
        WITH p, cat, count(r) AS verifiedBuys, coalesce(p.soldCount, 0) AS totalSold
        RETURN p.id AS id,
               p.name AS name,
               p.price AS price,
               p.originalPrice AS originalPrice,
               p.discountPercent AS discountPercent,
               p.imageUrl AS imageUrl,
               p.rating AS rating,
               totalSold AS soldCount,
               cat.name AS categoryName,
               round(5.0 + (totalSold * 0.01), 1) AS score,
               totalSold AS coBoughtCount,
               0 AS coViewedCount,
               verifiedBuys AS totalCoCustomers,
               "🔥 Bán chạy nhất tuần trên Shốp Pii (Dành cho bạn mới)" AS reason
        ORDER BY totalSold DESC, p.rating DESC
        LIMIT toInteger($limit)
      `;

      const fallbackResult = await session.run(coldStartCypher, {
        limit: neo4j.int(limit),
      });

      recommendations = fallbackResult.records.map((r) => ({
        id: r.get('id'),
        name: r.get('name'),
        price: neo4jToPlain(r.get('price')),
        originalPrice: neo4jToPlain(r.get('originalPrice')),
        discountPercent: neo4jToPlain(r.get('discountPercent')),
        imageUrl: r.get('imageUrl'),
        rating: neo4jToPlain(r.get('rating')),
        soldCount: neo4jToPlain(r.get('soldCount')),
        categoryName: r.get('categoryName'),
        score: neo4jToPlain(r.get('score')),
        coBoughtCount: neo4jToPlain(r.get('coBoughtCount')),
        coViewedCount: neo4jToPlain(r.get('coViewedCount')),
        totalCoCustomers: neo4jToPlain(r.get('totalCoCustomers')),
        reason: r.get('reason'),
      }));
    }

    res.json({
      success: true,
      meta: {
        customerId,
        customerName,
        strategy,
        totalItems: recommendations.length,
        algorithmDescription:
          strategy === 'collaborative_filtering'
            ? 'Gợi ý cá nhân hóa dựa trên những người có sở thích tương tự bạn'
            : 'Sản phẩm thịnh hành được mua nhiều nhất trên Shốp Pii',
      },
      data: recommendations,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const explainRecommendationQuery = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { customerId } = req.params;

    const explainCypher = `
      EXPLAIN
      MATCH (c1:Customer {id: $customerId})
      MATCH (c1)-[r1:BOUGHT|VIEWED]->(p1:Product)
      MATCH (p1)<-[r_shared:BOUGHT|VIEWED]-(c2:Customer)
      WHERE c2.id <> c1.id
      MATCH (c2)-[r2:BOUGHT|VIEWED]->(p2:Product)
      WHERE p2.id <> p1.id
        AND NOT (c1)-[:BOUGHT]->(p2)
      WITH p2,
           count(DISTINCT CASE WHEN type(r2) = 'BOUGHT' THEN c2 END) AS coBoughtCount,
           count(DISTINCT CASE WHEN type(r2) = 'VIEWED' THEN c2 END) AS coViewedCount
      WITH p2, round(coBoughtCount * 3.0 + coViewedCount * 1.0, 2) AS score
      RETURN p2.name AS productName, score
      ORDER BY score DESC
      LIMIT 10
    `;

    const result = await session.run(explainCypher, { customerId: customerId || 'CUST-001' });
    const plan = result.summary.plan;

    res.json({
      success: true,
      plan: plan ? serializePlan(plan) : null,
      query: explainCypher.replace('EXPLAIN\n', '').trim(),
    });
  } catch (error: any) {
    console.error('Error explaining query:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

const serializePlan = (plan: any): any => {
  return {
    operatorType: plan.operatorType,
    identifiers: plan.identifiers,
    arguments: plan.arguments,
    children: plan.children ? plan.children.map(serializePlan) : [],
  };
};

// Gợi ý theo sản phẩm: "Khách xem/mua sản phẩm này cũng quan tâm"
export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { productId } = req.params;
    const customerId = (req.query.customerId as string) || null;
    const limit = Math.max(1, Math.min(12, parseInt(req.query.limit as string) || 6));

    const fields = `p2.id AS id, p2.name AS name, p2.price AS price, p2.originalPrice AS originalPrice,
      p2.discountPercent AS discountPercent, p2.imageUrl AS imageUrl, p2.rating AS rating,
      p2.soldCount AS soldCount, cat.name AS categoryName`;

    const cypher = `
      MATCH (p:Product {id: $productId})<-[:BOUGHT|VIEWED]-(c:Customer)-[r:BOUGHT|VIEWED]->(p2:Product)
      WHERE p2.id <> p.id
        AND ($customerId IS NULL OR NOT EXISTS { (:Customer {id: $customerId})-[:BOUGHT]->(p2) })
      WITH p2,
           count(DISTINCT CASE WHEN type(r) = 'BOUGHT' THEN c END) AS coBoughtCount,
           count(DISTINCT CASE WHEN type(r) = 'VIEWED' THEN c END) AS coViewedCount
      OPTIONAL MATCH (p2)-[:BELONGS_TO]->(cat:Category)
      RETURN ${fields}, coBoughtCount, coViewedCount,
             coBoughtCount * 3.0 + coViewedCount AS score
      ORDER BY score DESC, p2.soldCount DESC
      LIMIT toInteger($limit)
    `;
    let result = await session.run(cypher, { productId, customerId, limit: neo4j.int(limit) });
    let strategy = 'co_interaction';

    if (result.records.length === 0) {
      strategy = 'same_category';
      result = await session.run(
        `MATCH (p:Product {id: $productId})-[:BELONGS_TO]->(cat:Category)<-[:BELONGS_TO]-(p2:Product)
         WHERE p2.id <> p.id
         WITH p2, cat, 0 AS coBoughtCount, 0 AS coViewedCount, 0 AS score
         RETURN ${fields}, coBoughtCount, coViewedCount, score
         ORDER BY p2.soldCount DESC LIMIT toInteger($limit)`,
        { productId, limit: neo4j.int(limit) }
      );
    }

    const data = result.records.map((r) => {
      const b = neo4jToPlain(r.get('coBoughtCount')) as number;
      const v = neo4jToPlain(r.get('coViewedCount')) as number;
      return {
        id: r.get('id'),
        name: r.get('name'),
        price: neo4jToPlain(r.get('price')),
        originalPrice: neo4jToPlain(r.get('originalPrice')),
        discountPercent: neo4jToPlain(r.get('discountPercent')),
        imageUrl: r.get('imageUrl'),
        rating: neo4jToPlain(r.get('rating')),
        soldCount: neo4jToPlain(r.get('soldCount')),
        categoryName: r.get('categoryName'),
        score: neo4jToPlain(r.get('score')),
        coBoughtCount: b,
        coViewedCount: v,
        totalCoCustomers: b + v,
        reason:
          strategy === 'same_category'
            ? 'Cùng danh mục'
            : b > 0
            ? `${b} khách đã mua cùng`
            : `${v} khách cũng xem`,
      };
    });

    res.json({ success: true, meta: { productId, strategy }, data });
  } catch (error: any) {
    console.error('Error getting related products:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};
