import { Router } from 'express';
import {
  getRecommendations,
  explainRecommendationQuery,
  getRelatedProducts,
} from '../controllers/recommendation.controller.js';

const router = Router();

router.get('/product/:productId', getRelatedProducts);
router.get('/:customerId', getRecommendations);
router.get('/:customerId/explain', explainRecommendationQuery);

export default router;
