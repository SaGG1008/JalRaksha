import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { AppDatabase } from './db/database';
import { TelemetrySimulator } from './services/simulator';
import { SocketHandler } from './socket/socketHandler';
import { createBorewellsRouter } from './routes/borewells';
import { createDevicesRouter } from './routes/devices';
import { createTelemetryRouter } from './routes/telemetry';
import { createAnomaliesRouter } from './routes/anomalies';
import { createSimulationRouter } from './routes/simulation';
import { createRechargeRouter } from './routes/recharge';
import { createSensorsRouter } from './routes/sensors';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend Vite dev server (port 3000) and general clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Initialize Database & Simulator
const db = AppDatabase.getInstance();
const simulator = new TelemetrySimulator(db);

// Initialize Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const socketHandler = new SocketHandler(io, simulator);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: 'connected (SQLite node:sqlite)',
      simulator: simulator.getStatus(),
    },
    message: 'JalRakshak Backend Service Operational',
  });
});

// Mount API Routers
app.use('/api/borewells', createBorewellsRouter(db, simulator));
app.use('/api/devices', createDevicesRouter(db));
app.use('/api/telemetry', createTelemetryRouter(db));
app.use('/api/anomalies', createAnomaliesRouter(db));
app.use('/api/simulation', createSimulationRouter(db, simulator));
app.use('/api/recharge', createRechargeRouter(db));
app.use('/api/sensors', createSensorsRouter(db));

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start simulator loop (every 2.0 seconds)
simulator.start(2000);

server.listen(PORT, () => {
  console.log(`[JalRakshak Server] Running at http://localhost:${PORT}`);
  console.log(`[JalRakshak Server] Real-time Socket.IO listening on port ${PORT}`);
  console.log(`[JalRakshak Server] Physical telemetry simulator active (2.0s cadence)`);
});
