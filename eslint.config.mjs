// eslint.config.mjs
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintRecommended from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "@typescript-eslint/eslint-plugin"; // Flat Config 용 추천 설정
import typescriptParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";

export default withNuxt([
  // 이제 배열 형태로 설정을 정의합니다.
  eslintRecommended.configs.recommended, // eslint:recommended 직접 포함
  prettierRecommended, // plugin:prettier/recommended 직접 포함
  tseslint.configs.tseslint, // @typescript-eslint/eslint-plugin의 Flat Config 용 추천 설정
  {
    languageOptions: {
      parser: typescriptParser, // @typescript-eslint/parser 직접 사용
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
]);
