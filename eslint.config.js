import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/*
  디자인 토큰을 우회하는 색을 막는다.

  화면 코드가 bg-white 나 text-gray-400 처럼 팔레트 색을 직접 쓰면
  그 자리에는 테마가 적용되지 않아 다크 모드에 구멍이 생긴다.
  사람이 리뷰로 잡기에는 놓치기 쉬워 규칙으로 세워 둔다.

  쓸 수 있는 이름은 src/styles/tokens.css 에 있고, 개발 서버에서 /dev/ui 로 볼 수 있다.
*/
const PALETTE =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const COLOR_PROPERTY =
  'bg|text|border|ring|divide|fill|stroke|from|via|to|placeholder|outline|decoration|caret|accent|shadow'

/** bg-white, text-gray-400, hover:border-red-500 … */
const PALETTE_CLASS = `(^|[\\s"'\`:])(${COLOR_PROPERTY})-(${PALETTE})(-\\d{2,3})?(\\/\\d{1,3})?($|[\\s"'\`])`
/** bg-[#fff], text-[#8E8E93] … */
const HEX_CLASS = `(${COLOR_PROPERTY})-\\[#[0-9a-fA-F]{3,8}\\]`

const message =
  '팔레트 색을 직접 쓰지 말고 역할 토큰을 쓰세요. ' +
  '예: bg-white → bg-surface, text-gray-400 → text-content-muted, ' +
  'text-red-500 → text-danger. 토큰 목록은 src/styles/tokens.css 에 있습니다.'

const noRawColors = [
  { selector: `Literal[value=/${PALETTE_CLASS}/]`, message },
  { selector: `Literal[value=/${HEX_CLASS}/]`, message },
  { selector: `TemplateElement[value.raw=/${PALETTE_CLASS}/]`, message },
  { selector: `TemplateElement[value.raw=/${HEX_CLASS}/]`, message },
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': ['error', ...noRawColors],
    },
  },
  {
    // 토큰이 어떤 팔레트 값에서 왔는지 보여 주는 곳이라 원래 값이 그대로 적혀 있어야 한다
    files: ['src/shared/constants/colors.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
])
