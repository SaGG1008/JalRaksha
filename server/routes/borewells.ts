import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';
import { TelemetrySimulator } from '../services/simulator';

export function createBorewellsRouter(db: AppDatabase, simulator: TelemetrySimulator): Router {
  const router = Router();

  // GET /api/borewells
  router.get('/', (_req: Request, res: Response) => {
    try {
      const borewells = db.getBorewells();
      res.json({ success: true, data: borewells });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch borewells' });
    }
  });

  // GET /api/borewells/:id
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const borewell = db.getBorewellById(req.params.id);
      if (!borewell) {
        return res.status(404).json({ success: false, error: `Borewell ${req.params.id} not found` });
      }
      res.json({ success: true, data: borewell });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch borewell' });
    }
  });

  // POST /api/borewells/:id/pump
  router.post('/:id/pump', (req: Request, res: Response) => {
    try {
      const borewell = db.getBorewellById(req.params.id);
      if (!borewell) {
        return res.status(404).json({ success: false, error: `Borewell ${req.params.id} not found` });
      }

      const requestedStatus = req.body.status;
      const newStatus = requestedStatus || (borewell.pumpStatus === 'ON' ? 'OFF' : 'ON');
      const isNowOn = newStatus === 'ON';

      db.updateBorewell(borewell.id, {
        pumpStatus: newStatus,
        flowRateLps: isNowOn ? 3.4 : 0.0,
      });

      const updated = db.getBorewellById(borewell.id);
      res.json({
        success: true,
        data: updated,
        message: `Borewell ${borewell.id} pump state switched to ${newStatus}`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to toggle pump' });
    }
  });

  return router;
}
