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

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Shốp Pii Recommendation System Backend API',
  });
});

export default router;
