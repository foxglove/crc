// @types/polycrc has incorrect definitions.
declare module "polycrc" {
  export function crc32(
    data: number | string | bigint | Buffer | ArrayBufferView | ArrayBuffer,
  ): number;
}
