"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = exports.logBuy = exports.logView = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const neo4j_js_1 = require("../config/neo4j.js");
const logView = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
    try {
        const { customerId, productId } = req.body;
        if (!customerId || !productId) {
            res.status(400).json({ success: false, message: 'Thiếu customerId hoặc productId' });
            return;
        }
        const cypher = `
      MATCH (c:Customer {id: $customerId})
      MATCH (p:Product {id: $productId})
      MERGE (c)-[r:VIEWED]->(p)
      ON CREATE SET r.createdAt = datetime().epochMillis,
                    r.lastViewedAt = datetime().epochMillis,
                    r.viewCount = 1
      ON MATCH SET r.lastViewedAt = datetime().epochMillis,
                   r.viewCount = coalesce(r.viewCount, 0) + 1
      RETURN c.name AS customerName, p.name AS productName, r.viewCount AS viewCount
    `;
        const result = await session.run(cypher, { customerId, productId });
        if (result.records.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy Customer hoặc Product với ID tương ứng',
            });
            return;
        }
        const record = result.records[0];
        res.json({
            success: true,
            message: 'Ghi nhận hành vi XEM (VIEWED) thành công',
            data: {
                customerId,
                productId,
                customerName: record.get('customerName'),
                productName: record.get('productName'),
                viewCount: (0, neo4j_js_1.neo4jToPlain)(record.get('viewCount')),
            },
        });
    }
    catch (error) {
        console.error('Error logging view behavior:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.logView = logView;
const logBuy = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
    try {
        const { customerId, productId, quantity = 1 } = req.body;
        if (!customerId || !productId) {
            res.status(400).json({ success: false, message: 'Thiếu customerId hoặc productId' });
            return;
        }
        const qty = Math.max(1, Number(quantity) || 1);
        const cypher = `
      MATCH (c:Customer {id: $customerId})
      MATCH (p:Product {id: $productId})
      CREATE (c)-[r:BOUGHT {
        timestamp: datetime().epochMillis,
        quantity: $qty,
        priceAtPurchase: p.price
      }]->(p)
      SET p.soldCount = coalesce(p.soldCount, 0) + $qty
      RETURN c.name AS customerName, p.name AS productName, p.soldCount AS newSoldCount, r.timestamp AS timestamp
    `;
        const result = await session.run(cypher, {
            customerId,
            productId,
            qty: neo4j_driver_1.default.int(qty),
        });
        if (result.records.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy Customer hoặc Product với ID tương ứng',
            });
            return;
        }
        const record = result.records[0];
        res.json({
            success: true,
            message: 'Ghi nhận hành vi MUA (BOUGHT) thành công',
            data: {
                customerId,
                productId,
                customerName: record.get('customerName'),
                productName: record.get('productName'),
                newSoldCount: (0, neo4j_js_1.neo4jToPlain)(record.get('newSoldCount')),
                timestamp: (0, neo4j_js_1.neo4jToPlain)(record.get('timestamp')),
            },
        });
    }
    catch (error) {
        console.error('Error logging buy behavior:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.logBuy = logBuy;
const checkout = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
    try {
        const { customerId, items } = req.body;
        if (!customerId || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin giỏ hàng hoặc customerId' });
            return;
        }
        const batch = items.map((item) => ({
            productId: item.productId,
            quantity: Math.max(1, Number(item.quantity) || 1),
        }));
        const cypher = `
      MATCH (c:Customer {id: $customerId})
      UNWIND $batch AS item
      MATCH (p:Product {id: item.productId})
      CREATE (c)-[r:BOUGHT {
        timestamp: datetime().epochMillis,
        quantity: item.quantity,
        priceAtPurchase: p.price
      }]->(p)
      SET p.soldCount = coalesce(p.soldCount, 0) + item.quantity
      RETURN count(r) AS boughtTotal
    `;
        const result = await session.run(cypher, { customerId, batch });
        const boughtTotal = (0, neo4j_js_1.neo4jToPlain)(result.records[0]?.get('boughtTotal')) || 0;
        res.json({
            success: true,
            message: `Đặt hàng thành công ${boughtTotal} sản phẩm! Đã cập nhật đồ thị hành vi Shốp Pii.`,
            data: {
                orderId: `ORD-${Date.now().toString().slice(-6)}`,
                itemsCount: boughtTotal,
                timestamp: Date.now(),
            },
        });
    }
    catch (error) {
        console.error('Error checking out cart:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.checkout = checkout;
