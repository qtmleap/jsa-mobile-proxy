import { GameJSONSchema } from "@/models/ai.dto";
import { fileURLToPath } from "bun";
import { describe } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { join } from "node:path/posix";
import { it } from "node:test";

const readJSONSync = (filePath: string): any => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return JSON.parse(readFileSync(join(__dirname, filePath), "utf8"))
}

describe("Equality", () => {
  const expected = readJSONSync("ip.jsamobile.jp/18440.json")
  const received = readJSONSync("d2pngvm764jm.cloudfront.net/18440.json")

  it('Decode To Record', () => {
    const result = GameJSONSchema.parse(received)
    writeFileSync("output.json", JSON.stringify(result, null, 2))
  })
})
