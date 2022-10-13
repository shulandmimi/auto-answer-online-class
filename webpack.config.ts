// @ts-ignore
import { Configuration, webpack } from 'webpack';
// @ts-ignore
import WrapperPlugin from 'wrapper-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import path from 'path';
import pkg from './package.json';

console.log(WrapperPlugin, pkg.version);

const inject_header = `// ==UserScript==
// @name         uooc/优课/智慧树 查题小组手
// @namespace    http://tampermonkey.net/
// @version      ${pkg.version}
// @description  进入做题界面自动查询答案并且填充内容
// @author       shulan
// @match        *://www.uooc.net.cn/exam/*
// @match        *://www.uooconline.com/exam/*
// @match        *://*.zhihuishu.com/*
// @match        *://*.chaoxing.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        window.onload
// @grant        window.console
// @license      MIT
// ==/UserScript==


`;

const compiler = webpack({
    entry: {
        main: './src/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{ loader: 'ts-loader', options: { configFile: path.resolve('tsconfig.node.json') } }],
            },
        ],
    },
    mode: 'production',
    devtool: false,
    output: {
        filename: '[name].js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    optimization: {
        minimizer: [],
    },
    externals: {
        unsafeWindow: 'unsafeWindow',
    },
    plugins: [
        new WrapperPlugin({
            header: inject_header,
        }),
        new CleanWebpackPlugin(),
    ],
} as Configuration);

compiler.run((err, stats) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(
        stats?.toString({
            colors: true,
        })
    );
});
