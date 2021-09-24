import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
    service: 'lambda-jjj',
    useDotenv: true,
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true
        }
    },
    plugins: ['serverless-webpack', 'serverless-offline'],
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        region: 'ap-southeast-1',
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
        },
        lambdaHashingVersion: '20201221'
    },
    package: {
        individually: true
    },
    // import the function via paths
    functions: {
        express: {
            handler: 'dist/src/server.handler',
            events: [
                {
                    http: {
                        method: 'ANY',
                        path: '/'
                    }
                },
                {
                    http: {
                        method: 'GET',
                        path: '/entries'
                    }
                },
                {
                    http: {
                        method: 'POST',
                        path: '/entries/sync'
                    }
                },
                {
                    http: {
                        method: 'GET',
                        path: '/entries/sync/callback'
                    }
                },
                {
                    http: {
                        method: 'POST',
                        path: '/auth/login/{type}'
                    }
                },
                {
                    http: {
                        method: 'POST',
                        path: '/auth/login'
                    }
                },
                {
                    http: {
                        method: 'GET',
                        path: '/auth/callback/{type}'
                    }
                },
                {
                    http: {
                        method: 'POST',
                        path: '/auth/refresh'
                    }
                },
                {
                    http: {
                        method: 'POST',
                        path: '/auth/logout'
                    }
                }
            ]
        }
    }
};

module.exports = serverlessConfiguration;
