module.exports = {
    devServer: {
        proxy: {
            '/': {
                target: 'http://localhost:3333',
                changeOrigin: true
            }
        },
        public: '0.0.0.0'
    },
    outputDir: 'dist/public',
    pages: {
        index: {
            entry: 'public/src/app.ts',
            template: 'public/index.html'
        },
        login: {
            entry: 'public/src/login.ts',
            template: 'public/login.html'
        }
    },
    chainWebpack: (config) => {
        config.plugin('fork-ts-checker').tap((args) => {
            args[0].tsconfig = './tsconfig.frontend.json';
            return args;
        });
    }
};
