"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const neo4j_js_1 = require("./config/neo4j.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Xác định đường dẫn thư mục frontend dist an toàn cho cả CJS và ESM
const getFrontendDist = () => {
    const rootDist = path_1.default.resolve(process.cwd(), 'frontend/dist');
    if (fs_1.default.existsSync(rootDist))
        return rootDist;
    const parentDist = path_1.default.resolve(process.cwd(), '../frontend/dist');
    if (fs_1.default.existsSync(parentDist))
        return parentDist;
    return rootDist;
};
const frontendDist = getFrontendDist();
// Middlewares
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});
// API Routes
app.use('/api', index_js_1.default);
// Phục vụ giao diện Frontend tĩnh khi đã build (Hỗ trợ Render Deploy 1 Web Service duy nhất)
app.use(express_1.default.static(frontendDist));
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
        return next();
    }
    const indexPath = path_1.default.join(frontendDist, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        res.json({
            message: 'Chào mừng đến với API Shốp Pii Recommendation System',
            apiHealth: '/api/health',
            products: '/api/products',
            categories: '/api/products/categories',
        });
    }
});
// Start Server
const startServer = async () => {
    console.log('🔄 Đang kiểm tra kết nối tới cơ sở dữ liệu Neo4j...');
    await (0, neo4j_js_1.verifyNeo4jConnection)();
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server Backend Shốp Pii đang chạy tại: http://localhost:${PORT}`);
        console.log(`📡 API Endpoints sẵn sàng tại: http://localhost:${PORT}/api`);
    });
    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🛑 Đang tắt server và đóng kết nối Neo4j...');
        await (0, neo4j_js_1.closeNeo4jDriver)();
        server.close(() => {
            console.log('✅ Server đã dừng an toàn.');
            process.exit(0);
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};
startServer();
