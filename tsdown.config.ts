import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
  },
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  clean: true,
  sourcemap: false,
  minify: true,
  outExtensions: () => ({ js: '.js' }),
})
