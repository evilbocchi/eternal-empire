import eslint from '@eslint/js';
import robloxTs from 'eslint-plugin-roblox-ts';
import tseslint from 'typescript-eslint';

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                jsx: true,
                useJSXTextNode: true,
                ecmaVersion: 2018,
                sourceType: 'module',
                project: true
            }
        },
        plugins: {
            'roblox-ts': robloxTs
        },
        rules: {
            'prefer-const': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'roblox-ts/no-private-identifier': 'off',
            'roblox-ts/lua-truthiness': 'off'
        }
    },
    {
        ignores: [
            'out/**',
            'node_modules/**',
            'docsout/**',
            'include/**',
            'test/**'
        ]
    }
];
