import { Router } from 'express';
import {
  getRecommendations,
  explainRecommendationQuery,
} from '../controllers/recommendation.controller.js';

const router = Router();

router.get('/:customerId', getRecommendations);
router.get('/:customerId/explain', explainRecommendationQuery);

export default router;
