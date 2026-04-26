
export function parseVlessHeader(buffer) {
  const data = new Uint8Array(buffer);
  
  // 1. Ambil Version & UUID (16 byte setelah byte pertama)
  const version = data[0];
  // UUID ada di index 1 sampai 16
  
  // 2. Lewati Add-on (Byte 17)
  const addonLength = data[17];
  
  // 3. Ambil Command (TCP/UDP) di gerbong setelah Add-on
  // Biasanya index ke-18 jika addonLength = 0
  const command = data[18 + addonLength]; 

  // 4. Ambil Port (Byte ke-19 dan 20)
  // Port menggunakan 16-bit integer (2 byte)
  const port = (data[19 + addonLength] << 8) | data[20 + addonLength];

  // 5. Tentukan Tipe Alamat (Byte ke-21)
  const addressType = data[21 + addonLength];
  let address = "";
  let addressEndIndex = 22 + addonLength;

  if (addressType === 1) {
    // Tipe IPv4: Ambil 4 byte berikutnya
    address = data.slice(addressEndIndex, addressEndIndex + 4).join('.');
    addressEndIndex += 4;
  } 
  else if (addressType === 2) {
    // Tipe Domain: Byte pertama adalah panjang domainnya
    const domainLength = data[addressEndIndex];
    addressEndIndex += 1; // Maju ke awal string domain
    address = new TextDecoder().decode(
      data.slice(addressEndIndex, addressEndIndex + domainLength)
    );
    addressEndIndex += domainLength;
  } 
  else if (addressType === 3) {
    // Tipe IPv6: Ambil 16 byte berikutnya
    // (Logikanya lebih kompleks, biasanya dikonversi ke format hex colons)
    addressEndIndex += 16;
  }

  let payload = null
  if (command === 2) {
    payload = data.slice(addressEndIndex + 2)
  } else if (command === 1) {
    payload = data.slice(addressEndIndex)
  }

  return {
    version,
    command,
    port,
    address,
    // Sisa data setelah header ini adalah data asli milik user (payload)
    payload
  };
}