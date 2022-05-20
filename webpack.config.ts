// @ts-ignore
import { Configuration, webpack } from 'webpack';
import path from 'path';

const compiler = webpack({
    entry: {
        main: './src/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{ loader: 'ts-loader', options: { 'configFile': path.resolve('tsconfig.node.json') }}],
            },
        ],
    },
    mode: 'production',
    devtool: 'hidden-nosources-cheap-module-source-map',
    output: {
        filename: '[name].js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    externals: {
        unsafeWindow: 'unsafeWindow'
    }
} as Configuration)

compiler.run((err, stats) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(stats?.toString({
        colors: true,
    }))
})