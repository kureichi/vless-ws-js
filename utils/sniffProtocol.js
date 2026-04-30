export function sniffProtocol(buffer) {
  const data = new Uint8Array(buffer);

  // 1. Cek potensi Trojan
  // Trojan punya CRLF (\r\n) di index 56 dan 57
  if (data[56] === 0x0D && data[57] === 0x0A) {
    return 'TROJAN';
  }

  // 2. Cek potensi VLESS
  // VLESS biasanya diawali dengan Version (0x00) dan punya UUID 16 byte.
  // Kita bisa cek apakah byte ke-17 adalah Add-on length (biasanya 0)
  // dan byte ke-18 adalah command valid (1 atau 2).
  const addonLength = data[17];
  const command = data[18 + addonLength];
  if (data[0] === 0x00 && (command === 1 || command === 2)) {
    return 'VLESS';
  }

  return 'UNKNOWN';
}
