import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
} from '../controllers/customer.controller.js';

const router = Router();

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);

export default router;
