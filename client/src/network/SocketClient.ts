import { io, Socket } from 'socket.io-client';

export class SocketClient {
  public socket: Socket;
  private static instance: SocketClient;

  private constructor() {
    // Connect to server (either direct host or relative in proxy mode)
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/';
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to Business Chess 3D server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  public off(event: string) {
    this.socket.off(event);
  }
}

export const socketClient = SocketClient.getInstance();
