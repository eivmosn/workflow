/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

test('package exposes the built CLI as npx bin', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

  assert.equal(packageJson.bin['codex-workflow'], './dist/cli.js')
  await access(new URL('../dist/cli.js', import.meta.url))
})

test('built CLI keeps the node shebang', async () => {
  const cli = await readFile(new URL('../dist/cli.js', import.meta.url), 'utf8')

  assert.match(cli, /^#!\/usr\/bin\/env node/)
})
