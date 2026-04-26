import dgram from 'dgram'

export class UDPSocket {
  constructor({ address, port, payload }) {
    this.udpSocket = dgram.createSocket('udp4')
    
    this.address = address
    this.port = port
    this.payload = payload
    
    console.log('[UDPSOCKET] Socket Created')
    this.write(payload)
  }
  
  write(payload) {
    this.udpSocket.send(payload, this.port, this.address)    
    console.log('[UDPSOCKET] Sended packet to ' + this.address)
  }
  
  relay(server) {
    this.udpSocket.on('message', (msgBin) => {
      const msgLength = msgBin.length
      const newArray = new Uint8Array(2 + msgLength)

      newArray[0] = ((msgLength >> 8) & 0xff)
      newArray[1] = msgLength & 0xff
      newArray.set(new Uint8Array(msgBin), 2)
      
      console.log('[UDPSOCKET] Relayed from ' + this.address)
      server.send(newArray)
    })    
  }
}