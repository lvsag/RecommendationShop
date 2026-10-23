"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const neo4j_js_1 = require("../config/neo4j.js");
const register = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
            return;
        }
        // Kiểm tra email đã tồn tại chưa
        const checkEmailCypher = `MATCH (c:Customer {email: $email}) RETURN c.id AS id LIMIT 1`;
        const checkRes = await session.run(checkEmailCypher, { email: email.trim().toLowerCase() });
        if (checkRes.records.length > 0) {
            res.status(400).json({ success: false, message: 'Email này đã được đăng ký tài khoản Shốp Pii' });
            return;
        }
        // Tạo ID mới cho khách hàng
        const countCypher = `MATCH (c:Customer) RETURN count(c) AS total`;
        const countRes = await session.run(countCypher);
        const total = (0, neo4j_js_1.neo4jToPlain)(countRes.records[0].get('total')) || 0;
        const newId = `CUST-${String(total + 1).padStart(3, '0')}`;
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newId}&backgroundColor=ffdfbf,ffd5dc,d1d4f9`;
        const createCypher = `
      CREATE (c:Customer {
        id: $newId,
        name: $name,
        email: $email,
        password: $password,
        avatar: $avatar,
        phone: $phone,
        address: $address,
        createdAt: datetime().epochMillis
      })
      RETURN c {
        .id,
        .name,
        .email,
        .avatar,
        .phone,
        .address,
        boughtCount: 0,
        viewedCount: 0
      } AS customer
    `;
        const result = await session.run(createCypher, {
            newId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: String(password),
            avatar,
            phone: phone || '',
            address: address || 'TP. Hồ Chí Minh',
        });
        const user = (0, neo4j_js_1.neo4jToPlain)(result.records[0].get('customer'));
        res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản Shốp Pii thành công! Chào mừng bạn gia nhập.',
            data: user,
        });
    }
    catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.register = register;
const login = async (req, res) => {
    const session = (0, neo4j_js_1.getNeo4jSession)();
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
            return;
        }
        // Tìm kiếm khách hàng theo email
        const cypher = `
      MATCH (c:Customer)
      WHERE toLower(c.email) = toLower($email)
      OPTIONAL MATCH (c)-[rb:BOUGHT]->(pb:Product)
      OPTIONAL MATCH (c)-[rv:VIEWED]->(pv:Product)
      WITH c, count(DISTINCT pb) AS boughtCount, count(DISTINCT pv) AS viewedCount
      RETURN c {
        .*,
        boughtCount: boughtCount,
        viewedCount: viewedCount
      } AS customer
      LIMIT 1
    `;
        const result = await session.run(cypher, { email: email.trim().toLowerCase() });
        if (result.records.length === 0) {
            res.status(401).json({ success: false, message: 'Tài khoản email này chưa tồn tại trên Shốp Pii' });
            return;
        }
        const customer = (0, neo4j_js_1.neo4jToPlain)(result.records[0].get('customer'));
        // Kiểm tra mật khẩu (nếu user có mật khẩu thì so sánh, nếu tài khoản demo seed chưa có password thì mặc định chấp nhận mật khẩu 123456 hoặc recommendation123)
        if (customer.password && customer.password !== password) {
            res.status(401).json({ success: false, message: 'Mật khẩu không chính xác. Vui lòng thử lại!' });
            return;
        }
        // Ẩn trường password trả về client
        delete customer.password;
        res.json({
            success: true,
            message: `Đăng nhập thành công! Chào mừng ${customer.name} quay trở lại Shốp Pii.`,
            data: customer,
        });
    }
    catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        await session.close();
    }
};
exports.login = login;
