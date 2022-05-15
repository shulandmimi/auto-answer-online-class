// @ts-ignore
import { Configuration } from 'webpack';
import path from 'path';

export default {
    entry: {
        main: './src/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{ loader: 'ts-loader', options: { 'configFile': path.resolve('tsconfig.webpack.json') }}],
            },
        ],
    },
    mode: 'production',
    devtool: 'cheap-module-source-map',
    output: {
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
} as Configuration;
