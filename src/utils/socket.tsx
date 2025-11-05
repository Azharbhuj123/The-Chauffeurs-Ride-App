// socket.js
import { io } from 'socket.io-client';
import base_url from './BaseUrl';

/**
 * Configure these:
 * - SOCKET_URL: aapka server URL (ws/https)
 * - options: reconnection, transports etc.
 */
const rawBaseUrl = base_url; // e.g. "https://example.com/api"
const SOCKET_URL = rawBaseUrl.replace(/\/api\/?$/, '');

const options = {
  autoConnect: false, // manually connect so we can set auth first
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
};

export const socket = io(SOCKET_URL, options);

export const joinUserRoom = (userId:string) => {
  if (socket.connected) return; // prevent reconnecting
  if (socket && userId) {
    socket.connect();
    socket.emit("join", userId);
    console.log("Joined socket room:", userId);
  }
};

 