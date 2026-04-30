export function parseTrojanHeader(buffer) {
  const data = new Uint8Array(buffer);

  // 1. Ambil Hash Password (56 byte pertama)
  const hexDecoder = new TextDecoder();
  const passwordHash = hexDecoder.decode(data.slice(0, 56));

  // 2. Cek apakah setelahnya ada \r\n (index 56 dan 57)
  if (data[56] !== 0x0D || data[57] !== 0x0A) return null;

  // 3. Command ada di index 58
  const command = data[58];
  const addressType = data[59];

  let address = "";
  let addressEndIndex = 60;
  if (addressType === 1) {
    // tipe ipv4, ambil 4 byte berikutnya
    address = data.slice(addressEndIndex, addressEndIndex + 4).join('.');
    addressEndIndex += 4;
  }
  else if (addressType === 3) {
    // tipe domain, byte pertama adalah panjang domainnya
    const domainLength = data[addressEndIndex];
    addressEndIndex += 1; // Maju ke awal string domain
    address = new TextDecoder().decode(
      data.slice(addressEndIndex, addressEndIndex + domainLength)
    );
    addressEndIndex += domainLength;
  }
  else if (addressType === 4) {
    address = data.slice(addressEndIndex, addressEndIndex + 16).join('.');
    addressEndIndex += 16;
  }

  // 4. Ambil Port
  const port = (data[addressEndIndex] << 8) | data[addressEndIndex + 1];
  addressEndIndex += 2;

  // 5. Pastikan ada CRLF penutup (\r\n) sebelum payload
  if (data[addressEndIndex] === 0x0D && data[addressEndIndex + 1] === 0x0A) {
    addressEndIndex += 2;
  }

  return {
    command,
    address,
    port,
    payload: data.slice(addressEndIndex) // Data mentah setelah \r\n kedua
  };
}
