import { watch } from 'rollup';
import path from 'path';
import { createConfig } from './common';

const config = createConfig('cjs');
console.log('start');
const instance = watch({
    ...config,
    watch: {
        include: [path.join(process.cwd(), './src/**/*')],
    },
});
instance.on('change', (id, change) => {
    console.log(id, change.event);
});
instance.on('close', () => {
    console.log('done');
});
instance.on('restart', () => {
    console.log('restart ...');
});
