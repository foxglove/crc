/// <reference types="./types" />

import { add, complete, cycle, suite } from "benny";
import { crc32 as crc_crc32 } from "crc";
import { buf as crc_32_buf } from "crc-32";
import crypto from "crypto";
import { crc32 as polycrc_crc32 } from "polycrc";

import { crc32, crc32GenerateTables, crc32Update } from "../src";

function generateCrc32TableTernary(polynomial: number) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) === 0 ? polynomial ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Use multiplication to avoid branching from ternary operator
function generateCrc32TableBranchless(polynomial: number) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) * polynomial) ^ (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

function crcUpdateNaive(prev: number, polynomial: number, data: Uint8Array): number {
  let r = prev;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < data.length; i++) {
    r ^= data[i]!;
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
    r = ((r & 1) * polynomial) ^ (r >>> 1);
  }
  return r;
}

const table = crc32GenerateTables({ polynomial: 0xedb88320, numTables: 16 });

function crcUpdate1byte(prev: number, data: Uint8Array): number {
  let r = prev;
  const length = data.length;
  for (let i = 0; i < length; i++) {
    r = table[(r ^ data[i]!) & 0xff]! ^ (r >>> 8);
  }
  return r;
}

function crcUpdate2byte(prev: number, data: Uint8Array): number {
  const array16 = new Uint16Array(data.buffer, data.byteOffset, data.byteLength >>> 1);
  const count = data.length >>> 1;
  let r = prev;
  for (let i = 0; i < count; i++) {
    r ^= array16[i]!;
    r = (r >>> 16) ^ table[0 * 256 + ((r >>> 8) & 0xff)]! ^ table[1 * 256 + (r & 0xff)]!;
  }
  if ((data.length & 1) === 1) {
    r = table[(r ^ data[data.length - 1]!) & 0xff]! ^ (r >>> 8);
  }
  return r;
}
function crcUpdate4byte(prev: number, data: Uint8Array): number {
  const array32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
  let r = prev;
  let remainingBytes = data.byteLength;
  for (let i = 0; remainingBytes >= 4; remainingBytes -= 4) {
    r ^= array32[i++]!;
    r =
      table[0 * 256 + ((r >>> 24) & 0xff)]! ^
      table[1 * 256 + ((r >>> 16) & 0xff)]! ^
      table[2 * 256 + ((r >>> 8) & 0xff)]! ^
      table[3 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let n = data.byteLength - remainingBytes; n < data.byteLength; n++) {
    r = table[(r ^ data[n]!) & 0xff]! ^ (r >>> 8);
  }
  return r;
}
function crcUpdate8byte(prev: number, data: Uint8Array): number {
  const array32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
  let r = prev;
  let remainingBytes = data.byteLength;
  for (let i = 0; remainingBytes >= 8; remainingBytes -= 8) {
    r ^= array32[i++]!;
    const r2 = array32[i++]!;
    r =
      table[0 * 256 + ((r2 >>> 24) & 0xff)]! ^
      table[1 * 256 + ((r2 >>> 16) & 0xff)]! ^
      table[2 * 256 + ((r2 >>> 8) & 0xff)]! ^
      table[3 * 256 + ((r2 >>> 0) & 0xff)]! ^
      table[4 * 256 + ((r >>> 24) & 0xff)]! ^
      table[5 * 256 + ((r >>> 16) & 0xff)]! ^
      table[6 * 256 + ((r >>> 8) & 0xff)]! ^
      table[7 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let i = data.byteLength - remainingBytes; i < data.byteLength; i++) {
    r = table[(r ^ data[i]!) & 0xff]! ^ (r >>> 8);
  }
  return r;
}

function crcUpdate16byte(prev: number, data: Uint8Array): number {
  const array32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
  let r = prev;
  let remainingBytes = data.byteLength;
  for (let i = 0; remainingBytes >= 16; remainingBytes -= 16) {
    r ^= array32[i++]!;
    const r2 = array32[i++]!;
    const r3 = array32[i++]!;
    const r4 = array32[i++]!;
    r =
      table[0 * 256 + ((r4 >>> 24) & 0xff)]! ^
      table[1 * 256 + ((r4 >>> 16) & 0xff)]! ^
      table[2 * 256 + ((r4 >>> 8) & 0xff)]! ^
      table[3 * 256 + ((r4 >>> 0) & 0xff)]! ^
      table[4 * 256 + ((r3 >>> 24) & 0xff)]! ^
      table[5 * 256 + ((r3 >>> 16) & 0xff)]! ^
      table[6 * 256 + ((r3 >>> 8) & 0xff)]! ^
      table[7 * 256 + ((r3 >>> 0) & 0xff)]! ^
      table[8 * 256 + ((r2 >>> 24) & 0xff)]! ^
      table[9 * 256 + ((r2 >>> 16) & 0xff)]! ^
      table[10 * 256 + ((r2 >>> 8) & 0xff)]! ^
      table[11 * 256 + ((r2 >>> 0) & 0xff)]! ^
      table[12 * 256 + ((r >>> 24) & 0xff)]! ^
      table[13 * 256 + ((r >>> 16) & 0xff)]! ^
      table[14 * 256 + ((r >>> 8) & 0xff)]! ^
      table[15 * 256 + ((r >>> 0) & 0xff)]!;
  }
  for (let i = data.byteLength - remainingBytes; i < data.byteLength; i++) {
    r = table[(r ^ data[i]!) & 0xff]! ^ (r >>> 8);
  }
  return r;
}

async function benchmarkTableGeneration() {
  await suite(
    "Table generation",
    add("ternary", async () => generateCrc32TableTernary(0xedb88320)),
    add("branchless", async () => generateCrc32TableBranchless(0xedb88320)),
    add("branchless unrolled", async () =>
      crc32GenerateTables({ polynomial: 0xedb88320, numTables: 1 }),
    ),
    cycle(),
    complete(),
  );
}

{
  console.log("Validating CRC implementations:");
  const data = crypto.randomBytes(1024 * 1024 + 1);
  const expected = crc32Update(0xffffffff, data) ^ 0xffffffff;
  const results = {
    current: expected,
    naive: crcUpdateNaive(0xffffffff, 0xedb88320, data) ^ 0xffffffff,
    "1 byte": crcUpdate1byte(0xffffffff, data) ^ 0xffffffff,
    "2 byte": crcUpdate2byte(0xffffffff, data) ^ 0xffffffff,
    "4 byte": crcUpdate4byte(0xffffffff, data) ^ 0xffffffff,
    "8 byte": crcUpdate8byte(0xffffffff, data) ^ 0xffffffff,
    "16 byte": crcUpdate16byte(0xffffffff, data) ^ 0xffffffff,
  };
  console.table([results]);
  for (const [key, result] of Object.entries(results)) {
    if (result !== expected) {
      throw new Error(`${key}: ${result} vs ${expected}`);
    }
  }
  console.log("Results match.");
}

async function benchmarkCrcCalculation() {
  await suite(
    "CRC",
    add("naive", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcUpdateNaive(0xffffffff, 0xedb88320, data) ^ 0xffffffff;
    }),
    add("1 byte", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcUpdate1byte(0xffffffff, data) ^ 0xffffffff;
    }),
    add("2 bytes", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcUpdate2byte(0xffffffff, data) ^ 0xffffffff;
    }),
    add("4 bytes", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcUpdate4byte(0xffffffff, data) ^ 0xffffffff;
    }),
    add("8 bytes", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcUpdate8byte(0xffffffff, data) ^ 0xffffffff;
    }),
    add("16 bytes", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crcUpdate16byte(0xffffffff, data) ^ 0xffffffff;
    }),
    add("current implementation", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crc32Update(0xffffffff, data) ^ 0xffffffff;
    }),
    add("current implementation, unaligned", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      const unalignedData = new Uint8Array(data.buffer, 1, data.byteLength - 1);
      return async () => crc32Update(0xffffffff, unalignedData) ^ 0xffffffff;
    }),
    cycle(),
    complete(),
  );
}

async function benchmarkAlternatives() {
  await suite(
    "Alternative libraries",
    add("crc", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      console.log("crc:", crc_crc32(data), crc32(data));
      return async () => crc_crc32(data);
    }),
    add("node-crc", async () => {
      // Hack to import ESM-only module: https://github.com/microsoft/TypeScript/issues/43329
      // eslint-disable-next-line no-eval
      const { crc32: node_crc_crc32 } = (await eval(
        "import('node-crc')",
      )) as typeof import("node-crc");
      const data = crypto.randomBytes(1024 * 1024);
      console.log("node-crc:", node_crc_crc32(data).readUInt32BE(0), crc32(data));
      return async () => node_crc_crc32(data).readUInt32BE(0);
    }),
    add("crc-32", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      console.log("crc-32:", crc_32_buf(data) >>> 0, crc32(data));
      return async () => crc_32_buf(data);
    }),
    add("polycrc", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      console.log("polycrc:", polycrc_crc32(data), crc32(data));
      return async () => polycrc_crc32(data);
    }),
    add("this package", async () => {
      const data = crypto.randomBytes(1024 * 1024);
      return async () => crc32(data);
    }),
    cycle(),
    complete(),
  );
}

async function main() {
  await benchmarkTableGeneration();
  await benchmarkCrcCalculation();
  await benchmarkAlternatives();
}

void main();
