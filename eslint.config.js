import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import prettierPlugin from "eslint-plugin-prettier";
import prettier from "eslint-plugin-prettier/recommended";
import robloxTs from "eslint-plugin-roblox-ts";
import tseslint from "typescript-eslint";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                jsx: true,
                useJSXTextNode: true,
                ecmaVersion: 2018,
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },
        plugins: {
            "roblox-ts": robloxTs,
            import: importPlugin,
            prettier: prettierPlugin,
            relativeImportPaths: noRelativeImportPaths,
        },
        rules: {
            "import/no-cycle": ["error", { maxDepth: 50 }],
            "relativeImportPaths/no-relative-import-paths": ["warn", { allowSameFolder: false, rootDir: "src" }],
            "prefer-const": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "roblox-ts/no-private-identifier": "off",
            "roblox-ts/lua-truthiness": "off",
            "prettier/prettier": ["error", { endOfLine: "auto" }],
        },
    },
    {
        ignores: [
            "out/**",
            "node_modules/**",
            "docsout/**",
            "include/**",
            "test/**",
            "roact_exported/**",
            "scripts/**",
            "src/shared/asset/AssetMap.ts",
        ],
    },
];
