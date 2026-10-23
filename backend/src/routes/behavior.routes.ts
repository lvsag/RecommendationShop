import { Router } from 'express';
import { logView, logBuy, checkout } from '../controllers/behavior.controller.js';

const router = Router();

router.post('/view', logView);
router.post('/buy', logBuy);
router.post('/checkout', checkout);

export default router;
