import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "Swallern_Pre_Implementation_Package/**",
      "do no touch this folder/**",
    ],
  },
];

export default eslintConfig;
