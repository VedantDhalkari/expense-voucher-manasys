import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { vouchersRoutes } from '../modules/vouchers/vouchers.routes';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/vouchers', vouchersRoutes);
router.use('/dashboard', dashboardRoutes);

export { router as routes };
