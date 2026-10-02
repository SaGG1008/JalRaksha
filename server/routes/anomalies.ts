import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';

export function createAnomaliesRouter(db: AppDatabase): Router {
  const router = Router();

  // GET /api/anomalies
  router.get('/', (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const severity = req.query.severity as string | undefined;
      const anomalies = db.getAnomalies(status, severity);
      res.json({ success: true, data: anomalies });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch anomalies' });
    }
  });

  // GET /api/anomalies/:id
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const anomaly = db.getAnomalyById(req.params.id);
      if (!anomaly) {
        return res.status(404).json({ success: false, error: `Anomaly ${req.params.id} not found` });
      }
      res.json({ success: true, data: anomaly });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch anomaly' });
    }
  });

  // POST /api/anomalies/:id/acknowledge
  router.post('/:id/acknowledge', (req: Request, res: Response) => {
    try {
      const anomaly = db.getAnomalyById(req.params.id);
      if (!anomaly) {
        return res.status(404).json({ success: false, error: `Anomaly ${req.params.id} not found` });
      }

      anomaly.status = 'investigating';
      db.insertAnomaly(anomaly);
      res.json({
        success: true,
        data: anomaly,
        message: `Anomaly ${anomaly.id} acknowledged and moved to investigation`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to acknowledge anomaly' });
    }
  });

  // POST /api/anomalies/:id/resolve
  router.post('/:id/resolve', (req: Request, res: Response) => {
    try {
      const anomaly = db.getAnomalyById(req.params.id);
      if (!anomaly) {
        return res.status(404).json({ success: false, error: `Anomaly ${req.params.id} not found` });
      }

      db.resolveAnomaly(req.params.id);

      // Restore healthy status to borewell if no other active anomalies
      const remainingActive = db
        .getAnomalies('active')
        .filter((a) => a.borewellId === anomaly.borewellId && a.id !== anomaly.id);

      if (remainingActive.length === 0) {
        db.updateBorewell(anomaly.borewellId, {
          status: 'healthy',
          healthScore: 88,
          healthStatusText: 'OPTIMAL STABLE AQUIFER',
        });
      }

      res.json({
        success: true,
        message: `Anomaly ${anomaly.id} marked resolved. Borewell health score restored.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to resolve anomaly' });
    }
  });

  return router;
}
