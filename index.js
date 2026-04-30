import express from 'express'
import { WebSocketServer } from 'ws'
import { VLESS } from './core/vless.js';
import { UDPSocket } from './services/udpSocket.js';
import { TCPSocket } from './services/tcpSocket.js';
import { createLogger } from './logger/log.js';

const logger = createLogger({ scopes: ['main', 'server', 'vless', 'tcpSocket', 'udpSocket'] })

const mainLogger = logger.getLogger('main')
const PORT = process.env.PORT
const app = express();
const server = app.listen(PORT, () => mainLogger.info(`Server ready at port ${PORT}`));
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (client) => {
    wss.emit('connection', client, request)
  })
})

const tcpSocket = new TCPSocket(logger.getLogger('tcpSocket'))
const udpSocket = new UDPSocket(logger.getLogger('udpSocket'))
const wsLogger = logger.getLogger('server')
wss.on('connection', (client) => {
  wsLogger.info('Incoming new connection')

  const vless = new VLESS(client, logger.getLogger('vless'), { tcpSocket, udpSocket })

  client.on('message', (data) => {
    vless.respond(data)
  });

  client.on('error', (error) => {
    wsLogger.error(error.message)
    client.close()
  })
});

wss.on('error', (error) => {
  wsLogger.error(error.message)
})
