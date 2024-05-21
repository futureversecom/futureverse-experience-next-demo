/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'avoid',
  semi: false,

  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
