import { Request, Response } from 'express';
import { getNeo4jSession, neo4jToPlain } from '../config/neo4j.js';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const cypher = `
      MATCH (c:Customer)
      OPTIONAL MATCH (c)-[rb:BOUGHT]->(pb:Product)
      OPTIONAL MATCH (c)-[rv:VIEWED]->(pv:Product)
      WITH c, count(DISTINCT pb) AS boughtCount, count(DISTINCT pv) AS viewedCount
      RETURN c {
        .*,
        boughtCount: boughtCount,
        viewedCount: viewedCount
      } AS customer
      ORDER BY c.id ASC
    `;

    const result = await session.run(cypher);
    const customers = result.records.map((r) => neo4jToPlain(r.get('customer')));

    res.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { id } = req.params;

    const cypher = `
      MATCH (c:Customer {id: $id})
      OPTIONAL MATCH (c)-[rb:BOUGHT]->(pb:Product)
      OPTIONAL MATCH (c)-[rv:VIEWED]->(pv:Product)
      WITH c,
           collect(DISTINCT pb { .id, .name, .price, .imageUrl }) AS boughtProducts,
           collect(DISTINCT pv { .id, .name, .price, .imageUrl }) AS viewedProducts
      RETURN c {
        .*,
        boughtProducts: boughtProducts,
        viewedProducts: viewedProducts
      } AS customerDetail
    `;

    const result = await session.run(cypher, { id });
    if (result.records.length === 0) {
      res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
      return;
    }

    const customer = neo4jToPlain(result.records[0].get('customerDetail'));
    res.json({ success: true, data: customer });
  } catch (error: any) {
    console.error('Error fetching customer by id:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const session = getNeo4jSession();
  try {
    const { id, name, email, avatar, phone, address } = req.body;

    if (!id || !name || !email) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: id, name, email' });
      return;
    }

    const cypher = `
      MERGE (c:Customer {id: $id})
      SET c.name = $name,
          c.email = $email,
          c.avatar = $avatar,
          c.phone = $phone,
          c.address = $address,
          c.createdAt = datetime().epochMillis
      RETURN c
    `;

    const result = await session.run(cypher, {
      id,
      name,
      email,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      phone: phone || '',
      address: address || '',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo khách hàng thành công',
      data: neo4jToPlain(result.records[0].get('c')),
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.close();
  }
};
