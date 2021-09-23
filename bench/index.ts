import { add, complete, cycle, suite } from "benny";
import crypto from "crypto";

function generateCrc32TableTernary() {
  const table32 = new Array<number>(256);
  const poly32 = 0xedb88320;
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) === 0 ? poly32 ^ (c >>> 1) : c >>> 1;
    }
    table32[n] = c;
  }
  return table32;
}

function generateCrc32TableBranchless() {
  const table32 = new Array<number>(256);
  const poly32 = 0xedb88320;
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) * poly32) ^ (c >>> 1);
    }
    table32[n] = c;
  }
}

function generateCrc32TablesBranchlessUnrolled(numTables: number) {
  const table32 = new Array<number>(numTables * 256);
  const poly32 = 0xedb88320;
  let i = 0;
  for (; i < 256; i++) {
    let c = i;
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    table32[i] = c;
  }
  for (; i < numTables * 256; i++) {
    const r = table32[i - 256]!;
    table32[i] = (r >>> 8) ^ table32[r & 0xff]!;
  }
  return table32;
}

function crcNaive(data: Uint8Array): number {
  const poly32 = 0xedb88320;
  let c = 0xffffffff;
  for (let n = 0; n < data.length; n++) {
    c ^= data[n]!;
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
    c = ((c & 1) * poly32) ^ (c >>> 1);
  }
  return c ^ 0xffffffff;
}

const table32 = generateCrc32TablesBranchlessUnrolled(32);

function crcTable(data: Uint8Array): number {
  const length = data.length;
  let r = 0xffffffff;
  for (let n = 0; n < length; n++) {
    r = table32[(r ^ data[n]!) & 0xff]! ^ (r >>> 8);
  }
  return r ^ 0xffffffff;
}

function crcTable2(data: Uint8Array): number {
  const array16 = new Uint16Array(data.buffer, data.byteOffset, data.byteLength >>> 1);
  const count = data.length >>> 1;
  let r = 0xffffffff;
  for (let i = 0; i < count; i++) {
    r ^= array16[i]!;
    r = (r >>> 16) ^ table32[0 * 256 + ((r >>> 8) & 0xff)]! ^ table32[1 * 256 + (r & 0xff)]!;
  }
  if ((data.length & 1) === 1) {
    r = table32[(r ^ data[data.length - 1]!) & 0xff]! ^ (r >>> 8);
  }
  return r ^ 0xffffffff;
}
function crcTable4(data: Uint8Array): number {
  const array32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
  const count = data.length >>> 2;
  let r = 0xffffffff;
  for (let i = 0; i < count; i++) {
    r ^= array32[i]!;
    r =
      table32[0 * 256 + ((r >>> 24) & 0xff)]! ^
      table32[1 * 256 + ((r >>> 16) & 0xff)]! ^
      table32[2 * 256 + ((r >>> 8) & 0xff)]! ^
      table32[3 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let n = count * 4; n < data.byteLength; n++) {
    r = table32[(r ^ data[n]!) & 0xff]! ^ (r >>> 8);
  }
  return r ^ 0xffffffff;
}
function crcTable8(data: Uint8Array): number {
  const array32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
  const count = (array32.length >>> 1) << 1;
  let r = 0xffffffff;
  for (let i = 0; i < count; ) {
    r ^= array32[i++]!;
    const r2 = array32[i++]!;
    r =
      table32[0 * 256 + ((r2 >>> 24) & 0xff)]! ^
      table32[1 * 256 + ((r2 >>> 16) & 0xff)]! ^
      table32[2 * 256 + ((r2 >>> 8) & 0xff)]! ^
      table32[3 * 256 + ((r2 >>> 0) & 0xff)]! ^
      table32[4 * 256 + ((r >>> 24) & 0xff)]! ^
      table32[5 * 256 + ((r >>> 16) & 0xff)]! ^
      table32[6 * 256 + ((r >>> 8) & 0xff)]! ^
      table32[7 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let i = count * 4; i < data.byteLength; i++) {
    r = table32[(r ^ data[i]!) & 0xff]! ^ (r >>> 8);
  }
  return r ^ 0xffffffff;
}
function crcTable8DataView(data: Uint8Array): number {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const count = ((data.byteLength >>> 2) >>> 1) << 3;
  let r = 0xffffffff;
  for (let i = 0; i < count; i += 8) {
    r ^= view.getUint32(i, true);
    const r2 = view.getUint32(i + 4, true);
    r =
      table32[0 * 256 + ((r2 >>> 24) & 0xff)]! ^
      table32[1 * 256 + ((r2 >>> 16) & 0xff)]! ^
      table32[2 * 256 + ((r2 >>> 8) & 0xff)]! ^
      table32[3 * 256 + ((r2 >>> 0) & 0xff)]! ^
      table32[4 * 256 + ((r >>> 24) & 0xff)]! ^
      table32[5 * 256 + ((r >>> 16) & 0xff)]! ^
      table32[6 * 256 + ((r >>> 8) & 0xff)]! ^
      table32[7 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let n = count; n < data.byteLength; n++) {
    r = table32[(r ^ data[n]!) & 0xff]! ^ (r >>> 8);
  }
  return r ^ 0xffffffff;
}
function crcTable16(data: Uint8Array): number {
  const array32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
  const count = (array32.length >>> 2) << 2;
  let r = 0xffffffff;
  for (let i = 0; i < count; ) {
    r ^= array32[i++]!;
    const r2 = array32[i++]!;
    const r3 = array32[i++]!;
    const r4 = array32[i++]!;
    r =
      table32[0 * 256 + ((r4 >>> 24) & 0xff)]! ^
      table32[1 * 256 + ((r4 >>> 16) & 0xff)]! ^
      table32[2 * 256 + ((r4 >>> 8) & 0xff)]! ^
      table32[3 * 256 + ((r4 >>> 0) & 0xff)]! ^
      table32[4 * 256 + ((r3 >>> 24) & 0xff)]! ^
      table32[5 * 256 + ((r3 >>> 16) & 0xff)]! ^
      table32[6 * 256 + ((r3 >>> 8) & 0xff)]! ^
      table32[7 * 256 + ((r3 >>> 0) & 0xff)]! ^
      table32[8 * 256 + ((r2 >>> 24) & 0xff)]! ^
      table32[9 * 256 + ((r2 >>> 16) & 0xff)]! ^
      table32[10 * 256 + ((r2 >>> 8) & 0xff)]! ^
      table32[11 * 256 + ((r2 >>> 0) & 0xff)]! ^
      table32[12 * 256 + ((r >>> 24) & 0xff)]! ^
      table32[13 * 256 + ((r >>> 16) & 0xff)]! ^
      table32[14 * 256 + ((r >>> 8) & 0xff)]! ^
      table32[15 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let n = count * 4; n < data.byteLength; n++) {
    r = table32[(r ^ data[n]!) & 0xff]! ^ (r >>> 8);
  }
  return r ^ 0xffffffff;
}

const benchmarkTableGeneration = async () => {
  await suite(
    "Table generation",
    add("ternary", async () => generateCrc32TableTernary()),
    add("branchless", async () => generateCrc32TableBranchless()),
    add("branchless unrolled", async () => generateCrc32TablesBranchlessUnrolled(1)),
    cycle(),
    complete(),
  );
};

const benchmarkCrcCalculation = async () => {
  await suite(
    "CRC",
    add("naive", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcNaive(data);
    }),
    add("table", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcTable(data);
    }),
    add("table 2 bytes at a time", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcTable2(data);
    }),
    add("table 4 bytes at a time", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcTable4(data);
    }),
    add("table 8 bytes at a time", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcTable8(data);
    }),
    add("table 8 bytes at a time with DataView", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcTable8DataView(data);
    }),
    add("table 16 bytes at a time", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcTable16(data);
    }),
    cycle(),
    complete(),
  );
};

async function main() {
  await benchmarkTableGeneration();
  await benchmarkCrcCalculation();
}

void main();
