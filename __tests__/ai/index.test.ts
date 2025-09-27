import { describe } from 'bun:test'
import { doesNotThrow } from 'node:assert'
import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { join } from 'node:path/posix'
import { it } from 'node:test'
import { fileURLToPath } from 'bun'
import { GameJSONSchema } from '@/models/ai.dto'

const readJSONSync = (filePath: string): any => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return JSON.parse(readFileSync(join(__dirname, filePath), 'utf8'))
}

describe('Equality', () => {
  const _expected = readJSONSync('ip.jsamobile.jp/18440.json')
  const received = readJSONSync('d2pngvm764jm.cloudfront.net/18440.json')

  it('Decode To Record', () => {
    doesNotThrow(() => GameJSONSchema.parse(received))
  })
})
