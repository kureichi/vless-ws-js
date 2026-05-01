import { SocksClient } from 'socks'; // npm install socks
import dgram from 'dgram'

const options = {
  proxy: {
    host: '127.0.0.1', // Host v2rayN
    port: 9886,        // Port SOCKS5 v2rayN
    type: 5
  },
  command: 'associate',
  destination: {
    host: '0.0.0.0',
    port: 0
  }
};

async function testUdp() {
  try {
    const udpSocket = dgram.createSocket('udp4');
    udpSocket.bind()

    let client = new SocksClient(options);

    udpSocket.on('message', (message, rinfo) => {
      console.log(SocksClient.parseUDPFrame(message));
    });

    client.on('established', info => {
      const buffer = Buffer.from([
        0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x06, 0x67, 0x6f, 0x6f,
        0x67, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d, 0x00,
        0x00, 0x01, 0x00, 0x01
      ])

      const packet = SocksClient.createUDPFrame({
        remoteHost: { host: '1.1.1.1', port: 53 }, // Your actual target
        data: buffer
      })

      udpSocket.send(packet, info.remoteHost.port, info.remoteHost.host, (err) => {
        if (err) console.error(err);
        console.log('UDP packet sent through relay');
        process.exit(0)
      })
    })
    
    

    client.connect()
  } catch (err) {
    console.error(err);
  }
}
testUdp();
