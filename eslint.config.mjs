import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    {
        ignores: [
            "dist",
            "release",
            "public/assets",
            "node_modules",
            "scripts",
        ],
    },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            prettier,
        ],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["*.config.ts", "vite.config.ts"],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { arguments: false } },
            ],
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/require-await": "error",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/no-shadow": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/unbound-method": "off",
            "no-console": ["error", { allow: ["warn", "error"] }],
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-duplicate-imports": "error",
            "no-throw-literal": "error",
            "no-unreachable": "error",
            "no-eval": "error",
            "no-param-reassign": ["error", { props: false }],
            "no-useless-escape": "warn",
        },
    },
    {
        extends: [js.configs.recommended, prettier],
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            "no-console": "off",
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
);
