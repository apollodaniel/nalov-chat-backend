import http from 'http';
import { WebSocketServer } from 'ws';

// Create an HTTP server
const server = http.createServer();

// Create a WebSocket server instance
const ws_server = new WebSocketServer({ server });

// Handle different paths
ws_server.on('connection', function connection(ws, request) {});
