import { SocketNamespace } from '@/enums/socket-namespace.enum';
import { CustomSocket } from '@/models/interfaces/socket.interface';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
  namespace: SocketNamespace.CLIENT_NOTIFICATIONS,
})
export class ClientNotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  static readonly ROOM = 'notifications';

  @WebSocketServer() private readonly server: Server;

  constructor() {}

  getServer() {
    return this.server;
  }

  handleConnection(client: CustomSocket) {
    client.join(ClientNotificationsGateway.ROOM);
    client.join(client.handshake.currentUserId);
  }

  handleDisconnect(client: CustomSocket) {
    client.leave(ClientNotificationsGateway.ROOM);
    client.leave(client.handshake.currentUserId);
  }
}
