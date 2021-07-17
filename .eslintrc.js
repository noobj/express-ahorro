module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json'],
        sourceType: 'module',
        extraFileExtensions: ['.vue']
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
    },
    overrides: [
        {
            files: ['*.vue'],
            parser: 'vue-eslint-parser',
            parserOptions: {
                parser: {
                    ts: "@typescript-eslint/parser",
                },
                project: ['tsconfig.frontend.json'],
            },
            extends: [
                'plugin:vue/essential',
                'plugin:@typescript-eslint/recommended',
                'plugin:prettier/recommended',
                '@vue/prettier'
            ],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-explicit-any': 'warn'
            }
        }
    ]
};
