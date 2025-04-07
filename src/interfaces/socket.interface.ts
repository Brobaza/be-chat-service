// import { Session } from '@/modules/sessions/entities/session.entity';
// import { User } from '@/modules/users/entities/users.entity';
import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket-types';

export type CustomSocket = Socket & {
  handshake: Handshake & {
    token: string;
    // currentSession: Session;
    // currentUser: User;
  };
};
