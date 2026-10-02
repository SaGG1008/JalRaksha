import { Server as SocketIOServer, Socket } from 'socket.io';
import { TelemetrySimulator } from '../services/simulator';

export class SocketHandler {
  private io: SocketIOServer;
  private simulator: TelemetrySimulator;

  constructor(io: SocketIOServer, simulator: TelemetrySimulator) {
    this.io = io;
    this.simulator = simulator;
    this.init();
  }

  private init() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      // Send initial simulation state
      socket.emit('simulation:state', this.simulator.getStatus());

      // Client can trigger scenario over socket as well
      socket.on('simulation:trigger', (data: { scenarioId: string; targetBorewell?: string }) => {
        this.simulator.setScenario(data.scenarioId as any, data.targetBorewell);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    // Wire simulator broadcast directly to Socket.IO clients
    this.simulator.setBroadcast((event: string, payload: any) => {
      this.io.emit(event, payload);
    });
  }

  public broadcast(event: string, payload: any) {
    this.io.emit(event, payload);
  }
}
