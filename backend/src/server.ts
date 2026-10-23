import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/index.js';
import { verifyNeo4jConnection, closeNeo4jDriver } from './config/neo4j.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Xác định đường dẫn thư mục frontend dist an toàn cho cả CJS và ESM
const getFrontendDist = () => {
  const rootDist = path.resolve(process.cwd(), 'frontend/dist');
  if (fs.existsSync(rootDist)) return rootDist;
  const parentDist = path.resolve(process.cwd(), '../frontend/dist');
  if (fs.existsSync(parentDist)) return parentDist;
  return rootDist;
};

const frontendDist = getFrontendDist();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Phục vụ giao diện Frontend tĩnh khi đã build (Hỗ trợ Render Deploy 1 Web Service duy nhất)
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
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
  await verifyNeo4jConnection();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server Backend Shốp Pii đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints sẵn sàng tại: http://localhost:${PORT}/api`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Đang tắt server và đóng kết nối Neo4j...');
    await closeNeo4jDriver();
    server.close(() => {
      console.log('✅ Server đã dừng an toàn.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
