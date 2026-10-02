import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';
import { TelemetrySimulator } from '../services/simulator';
import { SimulationScenarioId } from '../types';

export function createSimulationRouter(db: AppDatabase, simulator: TelemetrySimulator): Router {
  const router = Router();

  // GET /api/simulation/status
  router.get('/status', (_req: Request, res: Response) => {
    try {
      const status = simulator.getStatus();
      const state = db.getSimulationState();
      res.json({
        success: true,
        data: {
          ...status,
          ...state,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch simulation status' });
    }
  });

  // POST /api/simulation/start
  router.post('/start', (_req: Request, res: Response) => {
    try {
      simulator.start();
      res.json({ success: true, message: 'Simulation loop started' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to start simulation' });
    }
  });

  // POST /api/simulation/stop
  router.post('/stop', (_req: Request, res: Response) => {
    try {
      simulator.stop();
      res.json({ success: true, message: 'Simulation loop stopped' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to stop simulation' });
    }
  });

  // POST /api/simulation/scenario
  router.post('/scenario', (req: Request, res: Response) => {
    try {
      const scenarioId = req.body.scenarioId as SimulationScenarioId;
      const targetBorewell = (req.body.targetBorewell as string) || 'BWL-03';

      if (!scenarioId) {
        return res.status(400).json({ success: false, error: 'scenarioId is required' });
      }

      simulator.setScenario(scenarioId, targetBorewell);
      res.json({
        success: true,
        data: {
          scenarioId,
          targetBorewell,
          status: simulator.getStatus(),
        },
        message: `Simulation scenario ${scenarioId} activated on target ${targetBorewell}`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to set scenario' });
    }
  });

  // POST /api/simulation/reset
  router.post('/reset', (_req: Request, res: Response) => {
    try {
      simulator.resetScenario();
      res.json({
        success: true,
        message: 'Simulation reset to live nominal telemetry baseline',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to reset simulation' });
    }
  });

  return router;
}
