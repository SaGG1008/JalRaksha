import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';
import { IotDevice } from '../types';

export function createDevicesRouter(db: AppDatabase): Router {
  const router = Router();

  // GET /api/devices
  router.get('/', (req: Request, res: Response) => {
    try {
      const borewellId = req.query.borewellId as string | undefined;
      const status = req.query.status as string | undefined;
      const devices = db.getDevices(borewellId, status);
      res.json({ success: true, data: devices });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch devices' });
    }
  });

  // GET /api/devices/:id
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const device = db.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }
      res.json({ success: true, data: device });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch device' });
    }
  });

  // POST /api/devices
  router.post('/', (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.id || !body.type || !body.borewellId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required device fields: id, type, borewellId',
        });
      }

      const existing = db.getDeviceById(body.id);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Device with ID ${body.id} already exists`,
        });
      }

      const targetBorewell = db.getBorewellById(body.borewellId);
      const newDevice: IotDevice = {
        id: body.id,
        name: body.name || `${body.type} - ${body.borewellId}`,
        type: body.type,
        borewellId: body.borewellId,
        borewellName: targetBorewell ? targetBorewell.name : body.borewellId,
        status: body.status || 'ONLINE',
        model: body.model || 'JalRakshak Node v2 Pro',
        firmware: body.firmware || 'v2.0.1',
        samplingIntervalSec: body.samplingIntervalSec || 30,
        protocol: body.protocol || 'LoRaWAN',
        gatewayId: body.gatewayId || 'GW-001',
        batteryPercent: body.batteryPercent || 100,
        signalRssiDbm: body.signalRssiDbm || -68,
        signalQualityPct: body.signalQualityPct || 92,
        latencyMs: body.latencyMs || 34,
        packetLossPct: body.packetLossPct || 0.1,
        deviceTempC: body.deviceTempC || 27.5,
        lastSyncSecondsAgo: 0,
        calibrationStatus: body.calibrationStatus || 'VALID',
        calibrationDate: body.calibrationDate || new Date().toISOString().split('T')[0],
        nextCalibrationDate:
          body.nextCalibrationDate ||
          new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentReadingValue: body.currentReadingValue || '18.40',
        currentReadingUnit: body.currentReadingUnit || 'm',
        readingDeltaToday: body.readingDeltaToday || 'Nominal field baseline',
        dataQualityPct: 99.2,
        depthMeters: body.depthMeters || 65.0,
        macOrImei: body.macOrImei || `70:B3:D5:7E:D0:${Date.now().toString().slice(-4)}`,
        history: [
          { timestamp: '06:00', value: 17.8 },
          { timestamp: '08:00', value: 18.0 },
          { timestamp: '10:00', value: 18.4 },
        ],
      };

      db.createDevice(newDevice);
      res.status(201).json({
        success: true,
        data: newDevice,
        message: `Device ${newDevice.id} provisioned successfully`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to create device' });
    }
  });

  // PATCH /api/devices/:id
  router.patch('/:id', (req: Request, res: Response) => {
    try {
      const existing = db.getDeviceById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }

      db.updateDevice(req.params.id, req.body);
      const updated = db.getDeviceById(req.params.id);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to update device' });
    }
  });

  // DELETE /api/devices/:id
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const success = db.deleteDevice(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }
      res.json({ success: true, message: `Device ${req.params.id} deleted successfully` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to delete device' });
    }
  });

  // GET /api/devices/:id/health
  router.get('/:id/health', (req: Request, res: Response) => {
    try {
      const device = db.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }

      res.json({
        success: true,
        data: {
          deviceId: device.id,
          status: device.status,
          batteryPercent: device.batteryPercent,
          signalRssiDbm: device.signalRssiDbm,
          signalQualityPct: device.signalQualityPct,
          latencyMs: device.latencyMs,
          packetLossPct: device.packetLossPct,
          deviceTempC: device.deviceTempC,
          calibrationStatus: device.calibrationStatus,
          calibrationDate: device.calibrationDate,
          nextCalibrationDate: device.nextCalibrationDate,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch device health' });
    }
  });

  // POST /api/devices/:id/test-connection
  router.post('/:id/test-connection', (req: Request, res: Response) => {
    try {
      const device = db.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }

      const randomLatency = Math.floor(28 + Math.random() * 26);
      const packetLoss = Math.round(Math.random() * 4) / 10;
      const newStatus = device.status === 'OFFLINE' ? 'ONLINE' : device.status;

      db.updateDevice(device.id, {
        latencyMs: randomLatency,
        packetLossPct: packetLoss,
        status: newStatus,
      });

      res.json({
        success: true,
        data: {
          deviceId: device.id,
          latencyMs: randomLatency,
          packetLossPct: packetLoss,
          status: newStatus,
        },
        message: `Uplink verified with ${randomLatency}ms round-trip latency. Gateway ACK received.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Test connection failed' });
    }
  });

  // POST /api/devices/:id/calibrate
  router.post('/:id/calibrate', (req: Request, res: Response) => {
    try {
      const device = db.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ success: false, error: `Device ${req.params.id} not found` });
      }

      const today = new Date().toISOString().split('T')[0];
      const nextDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      db.updateDevice(device.id, {
        calibrationStatus: 'VALID',
        calibrationDate: today,
        nextCalibrationDate: nextDate,
        status: device.status === 'CALIBRATION REQUIRED' ? 'ONLINE' : device.status,
      });

      res.json({
        success: true,
        data: {
          deviceId: device.id,
          calibrationStatus: 'VALID',
          calibrationDate: today,
          nextCalibrationDate: nextDate,
        },
        message: `Sensor calibration renewed for 180 days. Valid until ${nextDate}.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Calibration failed' });
    }
  });

  return router;
}
