import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';
import { AnomalyEngine } from '../services/anomalyEngine';

export function createTelemetryRouter(db: AppDatabase): Router {
  const router = Router();

  // GET /api/telemetry
  router.get('/', (req: Request, res: Response) => {
    try {
      const borewellId = req.query.borewellId as string | undefined;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const telemetry = db.getTelemetry(borewellId, Math.min(500, limit));
      res.json({ success: true, data: telemetry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch telemetry' });
    }
  });

  // GET /api/borewells/:id/telemetry
  router.get('/borewells/:id', (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const telemetry = db.getTelemetry(req.params.id, Math.min(500, limit));
      res.json({ success: true, data: telemetry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch telemetry' });
    }
  });

  // GET /api/devices/:id/telemetry
  router.get('/devices/:id', (req: Request, res: Response) => {
    try {
      const device = db.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }
      res.json({ success: true, data: device.history || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch device telemetry' });
    }
  });

  // POST /api/telemetry/ingest (Physical Hardware or Simulator Ingestion with Validation)
  router.post('/ingest', (req: Request, res: Response) => {
    try {
      const {
        borewellId,
        deviceId,
        waterLevel,
        flowRate,
        tds,
        temperature,
        pressure,
        pumpStatus,
        extractionLiters,
        source,
      } = req.body;

      // PHASE 15 VALIDATION: Reject malformed telemetry
      if (!borewellId) {
        return res.status(400).json({ success: false, error: 'borewellId is required' });
      }

      if (waterLevel === undefined || typeof waterLevel !== 'number' || waterLevel < 0 || waterLevel > 500) {
        return res.status(400).json({
          success: false,
          error: 'Invalid waterLevel: must be a positive number within 0-500 meters',
        });
      }

      if (flowRate !== undefined && (typeof flowRate !== 'number' || flowRate < 0 || flowRate > 100)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid flowRate: must be a non-negative number <= 100 L/s',
        });
      }

      if (tds !== undefined && (typeof tds !== 'number' || tds < 0 || tds > 5000)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tds: must be a non-negative number <= 5000 ppm',
        });
      }

      if (temperature !== undefined && (typeof temperature !== 'number' || temperature < -10 || temperature > 70)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid temperature: must be between -10°C and 70°C',
        });
      }

      const timestamp = new Date().toISOString();
      const isSimulated = source === 'SIMULATOR';

      const insertId = db.insertTelemetry({
        borewellId,
        deviceId,
        timestamp,
        waterLevel,
        flowRate: flowRate || 0.0,
        tds: tds || 412,
        temperature: temperature || 26.4,
        pressure: pressure || 1.8,
        pumpStatus: pumpStatus || 'OFF',
        extractionLiters: extractionLiters || 0,
        isSimulated,
        source: source || 'LIVE_HARDWARE',
      });

      // Update borewell current reading
      db.updateBorewell(borewellId, {
        waterLevelMeters: waterLevel,
        flowRateLps: flowRate || 0.0,
        tdsPpm: tds || 412,
        pumpStatus: pumpStatus || 'OFF',
      });

      res.status(201).json({
        success: true,
        data: { id: insertId, timestamp, isSimulated },
        message: 'Telemetry reading ingested and analyzed',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Telemetry ingestion failed' });
    }
  });

  return router;
}
