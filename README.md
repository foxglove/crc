# @foxglove/crc

Fast CRC32 computation in TypeScript

[![npm version](https://img.shields.io/npm/v/@foxglove/crc)](https://www.npmjs.com/package/@foxglove/crc) ![](https://img.shields.io/badge/dependencies-0-green)

## Introduction

A [Cyclic Redundancy Check](https://en.wikipedia.org/wiki/Cyclic_redundancy_check) (CRC) is a calculation used to detect errors in data transmission.

This library implements **CRC32**, the standard 32-bit CRC using the binary polynomial `0xEDB88320`. This is the same algorithm used in [PNG](https://www.w3.org/TR/2003/REC-PNG-20031110/#D-CRCAppendix), [zlib](https://refspecs.linuxbase.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/zlib-crc32-1.html), and other popular applications.

## Interface

The following functions are exported from this package:

```ts
function crc32Init(): number;
function crc32Update(prev: number, data: ArrayBufferView): number;
function crc32Final(prev: number): number;

function crc32(data: ArrayBufferView): number;
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

## Benchmarks

This package achieves a >5x performance improvement over many other CRC packages, because of the multi-byte algorithms used (adapted from https://github.com/komrad36/CRC).

The following benchmarks were recorded on a MacBook Pro with an M1 Pro chip and 16GB of RAM. Each iteration ("op") is processing 1MB of data.

```
$ yarn bench
...
  crc:
    355 ops/s, ±0.56%     | 81.52% slower

  node-crc:
    376 ops/s, ±0.14%     | 80.43% slower

  crc-32:
    1 057 ops/s, ±0.16%   | 44.98% slower

  polycrc:
    327 ops/s, ±0.21%     | slowest, 82.98% slower

  this package:
    1 921 ops/s, ±0.18%   | fastest
```

## References

For further information about CRCs and their computation, see:

- https://en.wikipedia.org/wiki/Computation_of_cyclic_redundancy_checks
- https://github.com/komrad36/CRC
- https://create.stephan-brumme.com/crc32/
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

Join our [Slack channel](https://foxglove.dev/slack) to ask questions, share feedback, and stay up to date on what our team is working on.
