import dgram from 'dgram'
import EventEmitter from 'events'

export class UDPSocket {
  constructor(logger) {
    this.logger = logger
  }

  createSocket({ address, port }) {
    const udpSocket = dgram.createSocket('udp4')
    const emitter = new EventEmitter()

    udpSocket.on('message', (msgBin) => {
      this.logger.info(`Emit packet (${msgBin.length} bytes) from ${address}:${port}`)
      emitter.emit('packet', msgBin)
    })

    const send = (payload) => {
      this.logger.info(`Send packet (${payload.length} bytes) to ${address}:${port}`)
      udpSocket.send(payload, port, address)
    }

    this.logger.info(`Socket created`)

    return {
      send,
      on: (e, c) => emitter.on(e, c)
    }
  }
}
