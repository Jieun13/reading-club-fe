// Tailwind 4 방식 (PostCSS 전용 플러그인으로 분리됨)
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')({
      config: './tailwind.config.js', // 또는 생략 가능
    }),
    require('autoprefixer'),
  ],
};
