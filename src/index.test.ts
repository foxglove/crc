import { crc32, crc32Final, crc32Init, crc32Update } from "./index";

describe("crc32", () => {
  /**
   * Generated using zlib in Python:
   *
   *     [hex(zlib.crc32(bytes.fromhex(('0123456789abcdef'*3)[:2*i]))) for i in range(8*3+1)]
   */
  it.each(
    [
      0x0, 0xa505df1b, 0xfaa552cc, 0x469c715b, 0xfd2b0f7b, 0x814c57b2, 0xb6e80b1a, 0xca0340f1,
      0x28c7d1ae, 0x94439625, 0x3bf5092e, 0x859a254, 0x6ddad739, 0x190e86d6, 0xfcafec8a, 0x3a469452,
      0x67e86628, 0x90d79f87, 0x3295fe3, 0xedb4c00f, 0x9186b227, 0xe3fde7d0, 0x1536bade, 0x56a998e9,
      0x3b37e320,
    ].map((crc, i) => [crc, "0123456789abcdef".repeat(3).slice(0, 2 * i)] as [number, string]),
  )("returns %s when given %s", (expected, hex) => {
    expect(crc32(Buffer.from(hex, "hex"))).toBe(expected);
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
