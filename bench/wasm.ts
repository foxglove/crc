/*
const mod = new WebAssembly.Module(
  Buffer.from(
    "0061736D 01000000 01070160 027F7F01 7F020B01 026A7303 6D656D02 00010302 01000709 01056372 63333200 000A5001 4E01037F 41002104 417F2103 41002102 20030340 02402002 2001470D 00200341 7F730F0B 20034108 76200320 0220006A 2D000073 41FF0171 41027420 046A2802 00732103 20024101 6A21020C 000B0B00 2E046E61 6D650227 01000500 0A646174 615F7374 61727401 036C656E 02016903 0163040B 7461626C 655F7374 617274".replace(
      / /g,
      "",
    ),
    "hex",
  ),
);
const mem = new WebAssembly.Memory({ initial: 200 });
const instance = new WebAssembly.Instance(mod, {
  js: { mem },
  console: { log: (...x: unknown[]) => console.log(x) },
});
const array32 = new Uint32Array(mem.buffer);
array32.set(table32, 0);
// const data = [1, 2, 3, 4];
const array8 = new Uint8Array(mem.buffer);
// array8.set(data, table32.length * 4);

function crcWasm(data: Uint8Array) {
  array8.set(data, table32.length * 4);
  return (instance.exports.crc32 as (start: number, len: number) => number)(
    table32.length * 4,
    data.length,
  );
}

console.table(
  new Array(50).fill(0).map((_, n) => {
    const data = new Uint8Array(new Array(n).fill(0).map((__, i) => i));
    return {
      1: crcTable(data),
      2: crcTable2(data),
      4: crcTable4(data),
      8: crcTable8(data),
      16: crcTable16(data),
      wasm: crcWasm(data),
    };
  }),
);
process.exit(0);


  add("wasm", async () => {
    const data = crypto.randomBytes(1024 * 1024);
    array8.set(data, table32.length * 4);
    return async () => {
      (instance.exports.crc32 as (start: number, len: number) => number)(
        table32.length * 4,
        data.length,
      );
    };
  })

  */
