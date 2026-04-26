import express from 'express'
import { WebSocketServer } from 'ws'
import { VLESS } from './core/vless.js';

const PORT = process.env.PORT
const app = express();
const server = app.listen(PORT, () => console.log("[SERVER] Ready at port: " + PORT));
const wss = new WebSocketServer({ server });

const main = () => {
  wss.on('connection', (ws) => {
    console.log('[WEBSOCKET] Incoming Request')
    let vless = new VLESS(ws)

    ws.on('message', (data) => {
      if (!vless.started) {
        vless.start(data)
      } else {
        vless.continue(data)
      }
    });
    
    ws.on('error', (error) => {
      console.error('[WEBSOCKET/ERROR] ' + error.message)
      ws.close()
    })
  });
  
  wss.on('error', (error) => {
    console.error('[WEBSOCKET/ERROR] ' + error.message);
  })
}

const root = async () => {
  const execute = () => {
    main()
    console.log('[ROOT] Main started');
  }
  
  process.on('uncaughtException', (err) => {
    console.error('[ROOT] There was an uncaught error', err);
  })
  execute()
}

root()