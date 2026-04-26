
export function parseVlessHeader(buffer) {
  const data = new Uint8Array(buffer);
  
  const version = data[0];
  // btw UUID ada di index 1 sampai 16 tapi emang sengaja gk diambil
  
  const addonLength = data[17];
  const command = data[18 + addonLength]; 

  // port menggunakan 16-bit integer (2 byte, index ke 19 dan 20)
  const port = (data[19 + addonLength] << 8) | data[20 + addonLength];

  // ini address type bisa ipv4/6 bisa domain
  const addressType = data[21 + addonLength];

  let address = "";
  let addressEndIndex = 22 + addonLength;
  if (addressType === 1) {
    // tipe ipv4, ambil 4 byte berikutnya
    address = data.slice(addressEndIndex, addressEndIndex + 4).join('.');
    addressEndIndex += 4;
  } 
  else if (addressType === 2) {
    // tipe domain, byte pertama adalah panjang domainnya
    const domainLength = data[addressEndIndex];
    addressEndIndex += 1; // Maju ke awal string domain
    address = new TextDecoder().decode(
      data.slice(addressEndIndex, addressEndIndex + domainLength)
    );
    addressEndIndex += domainLength;
  } 
  else if (addressType === 3) {
    // tipe ipv6, ambil 16 byte berikutnya
    // karena males jadi gk implementasiin buat ipv6
    addressEndIndex += 16;
  }

  // ambil payload dari sisa data
  let payload = null
  if (command === 2) {
    // pengecualian buat udp karena payload harus diambil dari index ke 3 dari sisa data
    payload = data.slice(addressEndIndex + 2)
  } else if (command === 1) {
    payload = data.slice(addressEndIndex)
  }

  return {
    version,
    command,
    port,
    address,
    payload
  };
}