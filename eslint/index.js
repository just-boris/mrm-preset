const { json, packageJson, install } = require("mrm-core");

function task() {
  const packages = [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    // newer versions have a dependency on dubious package
    // https://github.com/futpib/eslint-template-visitor/issues/2
    "eslint-plugin-unicorn@11.0.2",
    "husky",
    "lint-staged",
    "prettier",
  ];

  const prettierrc = json(".prettierrc", {
    singleQuote: true,
    printWidth: 120,
  });
  prettierrc.save();

  const eslintrc = json(".eslintrc", {
    parser: "@typescript-eslint/parser",
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
      "prettier/@typescript-eslint",
    ],
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
    },
    plugins: ["unicorn"],
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "unicorn/filename-case": "error",
      curly: "error",
      eqeqeq: "error",
      "no-return-await": "error",
      "require-await": "error",
    },
  });

  const pkg = packageJson();

  if (pkg.get("dependencies.react") || pkg.get("devDependencies.react")) {
    packages.push("eslint-plugin-react", "eslint-plugin-react-hooks");
    eslintrc.merge({
      plugins: ["react-hooks", "react"],
      rules: {
        "react/display-name": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    });
  }

  pkg.merge({
    "lint-staged": {
      "*.{js,jsx,ts,tsx}": ["eslint --fix"],
    },
  });
  pkg.set("husky.hooks.pre-commit", "lint-staged");
  pkg.save();

  eslintrc.save();

  install(packages);
}

task.description = "Adds ESLint with a pre-commit hook";
module.exports = task;
