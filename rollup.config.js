import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const datestr = 'Jan 30, 2025'
const release = true;

const nodeenv = (release ? 'production' : 'development')
const tersopt = { format: { ascii_only:true } };
const tersplugin = (release ? terser(tersopt) : null);

export default {
    input: 'buildjs/main.js',
    output: {
        file: 'js/bundle.js',
        name: 'bundle',
        format: 'iife'
    },
    plugins: [
        replace({
            'preventAssignment': true,
            'process.env.NODE_ENV': JSON.stringify(nodeenv),
            '__VISIZORKDATE__': datestr,
        }),
        commonjs(),
        nodeResolve(),
        tersplugin,
    ]
}

