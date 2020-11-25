import extractModules from './modules';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";


function makeModule(base) {
    return function(a) {
        const k = a[0]
        const v = a[1]
        const submodules = Array.from(v.submodules.entries()).flatMap(makeModule(base + "/" + k))
        submodules.unshift({
            input: "src/modules" + base + '/' + k + ".ts",
            output: {
                file: 'dist/modules' + base + '/' + k + '.js' ,
                format: 'iife'
            },
            plugins: [
                nodeResolve({ preferBuiltins: false }),
                typescript(),
                commonjs(),
                json()
            ]
        })
        return submodules
    }
}

const modules = Array.from(extractModules(__dirname + "/src/modules").entries()).flatMap(makeModule(''));

modules.unshift({
    input: "src/ublatt.ts",
    output: {
        dir: 'dist',
        format: 'es'
    },
    plugins: [
        typescript(),
        nodeResolve(),
        commonjs()
    ]
})

export default modules