import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      'no-const-assign': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-unreachable': 'error',
      'valid-typeof': 'error',
      'camelcase': 'error',
      // 'arrow-body-style': ['error', 'as-needed'],
      'dot-notation': 'error',
      'eqeqeq': 'error',
      'func-style': ['error', 'declaration'],
      'require-await': 'error',
    },
  },
  stylistic.configs.customize({
  // the following options are the default values
    'indent': 2,
    'quotes': 'single',
    'semi': false,
    'comma-dangle': ['error', 'never'],
  }),
)
