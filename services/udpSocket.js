import dgram from 'dgram'

export class UDPSocket {
  constructor(logger) {
    this.logger = logger
  }

  createSocket({ address, port, client }) {
    const udpSocket = dgram.createSocket('udp4')

    udpSocket.on('message', (msgBin) => {
      const msgLength = msgBin.length
      const newArray = new Uint8Array(2 + msgLength)

      newArray[0] = ((msgLength >> 8) & 0xff)
      newArray[1] = msgLength & 0xff
      newArray.set(new Uint8Array(msgBin), 2)

      this.logger.info(`Relay packet (${newArray.length} bytes) from ${address}:${port} from client`)
      client.send(newArray)
    })

    const send = (payload) => {
      this.logger.info(`Send packet (${payload.length} bytes) to ${address}:${port}`)
      udpSocket.send(payload, port, address)
    }

    this.logger.info(`Socket created`)

    return {
      send
    }
  }
}
