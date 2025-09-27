import { fileURLToPath } from "bun";
import { describe } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { join } from "node:path/posix";

const readJSONSync = (filePath: string): any => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return JSON.parse(readFileSync(join(__dirname, filePath), "utf8"))
}

describe("Equality", () => {
  const expected = readJSONSync("ip.jsamobile.jp/18440.json")
  const received = readJSONSync("d2pngvm764jm.cloudfront.net/18440.json")


})
