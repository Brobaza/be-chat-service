import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket-types';

export type CustomSocket = Socket & {
  handshake: Handshake & {
    token: string;
    currentSessionId: string;
    currentUserId: string;
  };
};
