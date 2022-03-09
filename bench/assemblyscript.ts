import loader, { ASUtil } from "@assemblyscript/loader";
import fs from "fs";

const imports = {
  /* imports go here */
};
const wasmModule = loader.instantiateSync(
  fs.readFileSync(__dirname + "/../build/optimized.wasm"),
  imports,
);
export default wasmModule.exports as unknown as ASUtil & typeof import("../build/optimized.js");
