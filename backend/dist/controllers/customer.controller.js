"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const neo4j_js_1 = require("../config/neo4j.js");
const getCustomers = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
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
        const customers = result.records.map((r) => (0, neo4j_js_1.neo4jToPlain)(r.get('customer')));
        res.json({ success: true, data: customers });
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
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
        const customer = (0, neo4j_js_1.neo4jToPlain)(result.records[0].get('customerDetail'));
        res.json({ success: true, data: customer });
    }
    catch (error) {
        console.error('Error fetching customer by id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
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
            data: (0, neo4j_js_1.neo4jToPlain)(result.records[0].get('c')),
        });
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.createCustomer = createCustomer;
