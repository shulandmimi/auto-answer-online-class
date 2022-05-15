import { rollup } from 'rollup';
import { createConfig } from './common';

const config = createConfig('cjs');

rollup({
    ...config,
})
    .then(async res => {
        const outputList = Array.isArray(config.output) ? config.output : config.output ? [config.output] : [];
        for (const output of outputList) {
            console.log(output.dir, output.name || output.file || config.input, 'building');
            await res.write(output);
            console.log(output.name || output.file);
            console.log('completed');
        }
        console.log('all output complete ...');
    })
    .catch(err => {
        throw err;
    });
