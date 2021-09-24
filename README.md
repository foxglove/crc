# @foxglove/crc

Fast CRC32 computation in TypeScript

[![npm version](https://img.shields.io/npm/v/@foxglove/crc)](https://www.npmjs.com/package/@foxglove/crc)

## Introduction

A [Cyclic Redundancy Check](https://en.wikipedia.org/wiki/Cyclic_redundancy_check) (CRC) is a calculation used to detect errors in data transmission.

This library implements **CRC32**, the standard 32-bit CRC using the binary polynomial `0xEDB88320`. This is the same algorithm used in [PNG](https://www.w3.org/TR/2003/REC-PNG-20031110/#D-CRCAppendix), [zlib](https://refspecs.linuxbase.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/zlib-crc32-1.html), and other popular applications.

## Interface

The following functions are exported from this package:

```ts
function crc32Init(): number;
function crc32Update(prev: number, data: Uint8Array): number;
function crc32Final(prev: number): number;

function crc32(data: Uint8Array): number;
```

Note: Since the CRC algorithm works with unsigned data, the `crc32` and `crc32Final` functions always return **non-negative** numbers. For example, CRC32(0x01) returns 2768625435 rather than -1526341861.

## Usage

```ts
import { crc32 } from "@foxglove/crc";

const data = new Uint8Array(...);

const crc = crc32(data);
```

```ts
import { crc32Init, crc32Update, crc32Final } from "@foxglove/crc";

let crc = crc32Init();
while (/* more data available */) {
  crc = crc32Update(crc, data);
}
crc = crc32Final(crc);
```

## References

For further information about CRCs and their computation, see:

- https://en.wikipedia.org/wiki/Computation_of_cyclic_redundancy_checks
- https://github.com/komrad36/CRC
- https://zlib.net/crc_v3.txt
- https://github.com/Michaelangel007/crc32
- https://docs.microsoft.com/en-us/openspecs/office_protocols/ms-abs/06966aa2-70da-4bf9-8448-3355f277cd77

## License

@foxglove/crc is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Releasing

1. Run `yarn version --[major|minor|patch]` to bump version
2. Run `git push && git push --tags` to push new tag
3. GitHub Actions will take care of the rest

## Stay in touch

Join our [Slack channel](https://foxglove.dev/join-slack) to ask questions, share feedback, and stay up to date on what our team is working on.
