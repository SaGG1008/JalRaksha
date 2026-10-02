import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';

export function createRechargeRouter(db: AppDatabase): Router {
  const router = Router();

  // GET /api/recharge
  router.get('/', (_req: Request, res: Response) => {
    try {
      const recharge = db.getRecharge();
      res.json({ success: true, data: recharge });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch recharge assessment' });
    }
  });

  return router;
}
