import { crc32, crc32Final, crc32Init, crc32Update } from "./index";

describe("crc32", () => {
  it("returns correct results for any alignment", () => {
    // Generated using zlib via Python:
    // [hex(zlib.crc32(bytes.fromhex(('0123456789abcdef'*3)[:2*i]))) for i in range(8*3+1)]
    const expected = [
      0x0, 0xa505df1b, 0xfaa552cc, 0x469c715b, 0xfd2b0f7b, 0x814c57b2, 0xb6e80b1a, 0xca0340f1,
      0x28c7d1ae, 0x94439625, 0x3bf5092e, 0x859a254, 0x6ddad739, 0x190e86d6, 0xfcafec8a, 0x3a469452,
      0x67e86628, 0x90d79f87, 0x3295fe3, 0xedb4c00f, 0x9186b227, 0xe3fde7d0, 0x1536bade, 0x56a998e9,
      0x3b37e320,
    ];
    expected.forEach((crc, length) => {
      const hex = "0123456789abcdef".repeat(3).slice(0, 2 * length);
      for (let offset = 0; offset < 64; offset++) {
        // Using Buffer.alloc instead of Buffer.from ensures the buffer is newly allocated so its
        // initial byteOffset will be 0.
        const data = Buffer.alloc(offset + length, "fe".repeat(offset) + hex, "hex");
        expect(data.byteOffset).toBe(0);
        expect(crc32(new Uint8Array(data.buffer, offset, length))).toBe(crc);
      }
    });
  });

  it("returns correct result for incremental updates", () => {
    const buf = Buffer.from("0123456789abcdef", "hex");
    let value = crc32Init();
    for (const byte of buf) {
      value = crc32Update(value, new Uint8Array([byte]));
    }
    expect(crc32Final(value)).toBe(0x28c7d1ae);
  });
});
