import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';

export function createSensorsRouter(db: AppDatabase): Router {
  const router = Router();

  // GET /api/sensors
  router.get('/', (req: Request, res: Response) => {
    try {
      const borewellId = req.query.borewellId as string | undefined;
      const sensors = db.getSensors(borewellId);
      res.json({ success: true, data: sensors });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch sensors' });
    }
  });

  return router;
}
