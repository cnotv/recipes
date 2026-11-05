import javascript from '@eslint/js'
import functional from 'eslint-plugin-functional'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import typescript from 'typescript-eslint'

export default typescript.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  javascript.configs.recommended,
  ...typescript.configs.strict,
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: typescript.parser } },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { functional },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'functional/no-classes': 'error',
      'functional/no-loop-statements': 'error',
      'prefer-const': 'error',
    },
  },
)
