import { defineConfig, ModuleFormat } from 'rollup';
import path from 'path';
import TypescriptPlugin from '@rollup/plugin-typescript';
import pkg from '../package.json';

const resolveRoot = (filename: string) => path.join(process.cwd(), filename);

export function createConfig(name: ModuleFormat) {
    return defineConfig({
        input: resolveRoot('./src/index.ts'),
        output: {
            file: './dist/main.js',
            format: name,
        },
        external: [...Object.keys(pkg.dependencies)],
        plugins: [TypescriptPlugin()],
        treeshake: true,
    });
}
