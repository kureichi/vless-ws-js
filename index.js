import express from 'express'
import { WebSocketServer } from 'ws'
import { VLESS } from './core/vless.js';
import { UDPSocket } from './services/udpSocket.js';
import { TCPSocket } from './services/tcpSocket.js';
import { createLogger } from './logger/log.js';
import { Proxy } from './core/proxy.js';
import { TROJAN } from './core/trojan.js';

const logger = createLogger({ scopes: ['main', 'server', 'proxy', 'vless', 'trojan', 'tcpSocket', 'udpSocket'] })

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
const vless = new VLESS(logger.getLogger('vless'))
const trojan = new TROJAN(logger.getLogger('trojan'))

const proxyInstance = new Proxy(logger.getLogger('proxy'), { vless, trojan })

const wsLogger = logger.getLogger('server')
wss.on('connection', (client) => {
  wsLogger.info('Incoming new connection')

  const proxy = proxyInstance.createProxy(client, { tcpSocket, udpSocket })

  client.on('message', (data) => {
    proxy.respond(data)
  });

  client.on('error', (error) => {
    wsLogger.error(error.message)
    client.close()
  })
});

wss.on('error', (error) => {
  wsLogger.error(error.message)
})
