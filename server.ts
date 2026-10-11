import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/app.js';
import { getDb } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const server = http.createServer(app);

  // Initialize DB on boot
  try {
    await getDb();
    console.log('PostgreSQL database (PGlite engine) initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL database:', err);
  }

  // -------------------------------------------------------------------------
  // WebRTC Signalling & Real-Time Chat WebSocket Server
  // -------------------------------------------------------------------------
  const wss = new WebSocketServer({ noServer: true });

  interface PeerInfo {
    ws: WebSocket;
    sessionId: string;
    role: 'guest' | 'counsellor';
    alias: string;
  }

  const rooms = new Map<string, Map<WebSocket, PeerInfo>>();

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join-room') {
          const { sessionId, role, alias } = message;
          if (!sessionId) return;

          currentRoomId = sessionId;
          if (!rooms.has(sessionId)) {
            rooms.set(sessionId, new Map());
          }

          const room = rooms.get(sessionId)!;
          const peerInfo: PeerInfo = {
            ws,
            sessionId,
            role: role || 'guest',
            alias: alias || (role === 'counsellor' ? 'Dr. Evelyn Reed' : 'Anonymous Guest')
          };
          room.set(ws, peerInfo);

          // Notify existing room members that peer joined
          room.forEach((peer, otherWs) => {
            if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
              otherWs.send(JSON.stringify({
                type: 'peer-joined',
                peerRole: peerInfo.role,
                peerAlias: peerInfo.alias
              }));
              // Also inform the newly joined peer about the existing member
              ws.send(JSON.stringify({
                type: 'peer-joined',
                peerRole: peer.role,
                peerAlias: peer.alias
              }));
            }
          });
          return;
        }

        // Forward signalling messages (offer, answer, ice-candidate, chat-message, media-state)
        if (currentRoomId && rooms.has(currentRoomId)) {
          const room = rooms.get(currentRoomId)!;
          room.forEach((_, otherWs) => {
            if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
              otherWs.send(JSON.stringify(message));
            }
          });
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    const cleanup = () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId)!;
        const peer = room.get(ws);
        room.delete(ws);

        // Notify remaining peer that this user left
        room.forEach((_, otherWs) => {
          if (otherWs.readyState === WebSocket.OPEN) {
            otherWs.send(JSON.stringify({
              type: 'peer-left',
              role: peer?.role,
              alias: peer?.alias
            }));
          }
        });

        if (room.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);
  });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname.startsWith('/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // -------------------------------------------------------------------------
  // Vite Integration in Development / Static Files in Production
  // -------------------------------------------------------------------------
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Stress Prediction System running at http://localhost:${PORT}`);
    console.log(`REST API endpoints active at http://localhost:${PORT}/api`);
    console.log(`WebSocket signalling active at ws://localhost:${PORT}/ws`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
