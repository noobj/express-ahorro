module.exports = {
    devServer: {
        proxy: {
            '/': {
                target: 'http://localhost:3333',
                changeOrigin: true
            },
        },
        public: '0.0.0.0'
    },
    outputDir: 'dist/public',
    pages: {
        index: {
            entry: 'public/src/app.js',
            template: 'public/index.html'
        }
    }
}
