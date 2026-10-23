import { Router } from 'express';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import behaviorRoutes from './behavior.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/behavior', behaviorRoutes);
router.use('/recommendations', recommendationRoutes);

import { verifyNeo4jConnection, getNeo4jConfig, initNeo4jDriver } from '../config/neo4j.js';
import { runSeed } from '../scripts/seed.js';

// Health check endpoint with Neo4j diagnostic
router.get('/health', async (req, res) => {
  const config = getNeo4jConfig();
  const dbStatus = await verifyNeo4jConnection();
  
  res.json({
    status: dbStatus.connected ? 'ok' : 'database_disconnected',
    database: {
      connected: dbStatus.connected,
      uri: config.uri,
      user: config.user,
      databaseName: config.database,
      isDefaultLocalhost: config.isDefaultLocal,
      error: dbStatus.error || null,
      instruction: !dbStatus.connected
        ? config.isDefaultLocal
          ? 'Máy chủ đang trỏ đến localhost:7687 (mặc định). Khi deploy Render, bạn cần tạo database đám mây Neo4j AuraDB (miễn phí) và điền các biến NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD trên tab Environment của Render.'
          : 'Không thể kết nối đến Neo4j URI đã cấu hình. Vui lòng kiểm tra lại mật khẩu, giao thức (neo4j+s:// cho Aura) hoặc tình trạng database trên Neo4j Console.'
        : 'Kết nối Neo4j thành công.',
    },
    timestamp: new Date().toISOString(),
    service: 'Shốp Pii Recommendation System Backend API',
  });
});

// Admin Seed Endpoint (hỗ trợ cả GET & POST để dễ dàng khởi tạo dữ liệu trực tiếp từ browser)
const handleSeed = async (req: any, res: any) => {
  try {
    const driver = initNeo4jDriver();
    const result = await runSeed(driver);
    if (result.success) {
      res.json({
        success: true,
        message: 'Khởi tạo dữ liệu mẫu Neo4j thành công!',
        data: result.stats,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi khởi tạo dữ liệu mẫu Neo4j',
        error: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi seed',
      error: error?.message || String(error),
    });
  }
};

router.post('/admin/seed', handleSeed);
router.get('/admin/seed', handleSeed);

export default router;
