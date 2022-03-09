export function crc32GenerateTables(): Uint32Array {
  const numTables = 8;
  const polynomial = 0xedb88320;
  const table = new Uint32Array(256 * numTables);
  for (let i = 0; i < 256; i++) {
    let r = i;
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    table[i] = r;
  }
  for (let i = 256; i < table.length; i++) {
    const value = table[i - 256];
    table[i] = table[value & 0xff] ^ (value >>> 8);
  }
  return table;
}

const CRC32_TABLE = crc32GenerateTables();

/**
 * Initialize a CRC32 to all 1 bits.
 */
export function crc32Init(): u32 {
  return ~0;
}

/**
 * Update a streaming CRC32 calculation.
 *
 * For performance, this implementation processes the data 8 bytes at a time, using the algorithm
 * presented at: https://github.com/komrad36/CRC#option-9-8-byte-tabular
 */
export function crc32Update(prev: u32, data: Uint8Array, byteLength: u32): u32 {
  const view = new DataView(data.buffer, data.byteOffset, byteLength);
  let r = prev;
  let offset: u32 = 0;

  // Process bytes one by one until we reach 4-byte alignment, which will speed up uint32 access.
  const toAlign: u32 = -view.byteOffset & 3;
  for (; offset < toAlign && offset < byteLength; offset++) {
    r = CRC32_TABLE[(r ^ view.getUint8(offset)) & 0xff] ^ (r >>> 8);
  }
  if (offset === byteLength) {
    return r;
  }

  offset = toAlign;

  // Process 8 bytes (2 uint32s) at a time.
  let remainingBytes = byteLength - offset;
  for (; remainingBytes >= 8; offset += 8, remainingBytes -= 8) {
    r ^= view.getUint32(offset, true);
    const r2 = view.getUint32(offset + 4, true);
    r =
      CRC32_TABLE[0 * 256 + ((r2 >>> 24) & 0xff)] ^
      CRC32_TABLE[1 * 256 + ((r2 >>> 16) & 0xff)] ^
      CRC32_TABLE[2 * 256 + ((r2 >>> 8) & 0xff)] ^
      CRC32_TABLE[3 * 256 + ((r2 >>> 0) & 0xff)] ^
      CRC32_TABLE[4 * 256 + ((r >>> 24) & 0xff)] ^
      CRC32_TABLE[5 * 256 + ((r >>> 16) & 0xff)] ^
      CRC32_TABLE[6 * 256 + ((r >>> 8) & 0xff)] ^
      CRC32_TABLE[7 * 256 + ((r >>> 0) & 0xff)];
  }

  // Process any remaining bytes one by one. (Perf note: inexplicably, using a temporary variable
  // `i` rather than reusing `offset` here is faster in V8.)
  for (let i = offset; i < byteLength; i++) {
    r = CRC32_TABLE[(r ^ view.getUint8(i)) & 0xff] ^ (r >>> 8);
  }
  return r;
}

/**
 * Finalize a CRC32 by inverting the output value. An unsigned right-shift of 0 is used to ensure the result is a positive number.
 */
export function crc32Final(prev: u32): u32 {
  return (prev ^ ~0) >>> 0;
}

/**
 * Calculate a one-shot CRC32. If the data is being accumulated incrementally, use the functions
 * `crc32Init`, `crc32Update`, and `crc32Final` instead.
 */
export function crc32(data: Uint8Array, length: u32): u32 {
  return crc32Final(crc32Update(crc32Init(), data, length));
}

export function createUint8Array(length: i32): Uint8Array {
  return new Uint8Array(length);
}
