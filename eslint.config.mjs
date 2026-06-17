import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'agents/**',
    'skills/**',
    'dist/**',
    'node_modules/**',
  ],
})
