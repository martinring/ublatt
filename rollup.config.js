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
            input: "src/runtime/modules" + base + '/' + k + ".ts",
            output: {
                file: 'dist/modules' + base + '/' + k + '.js' ,
                format: 'es'
            },
            plugins: [
                nodeResolve({ preferBuiltins: false }),
                commonjs(),
                typescript({ "tsconfig": "src/runtime/tsconfig.json"}),
                json()
            ]
        })
        return submodules
    }
}

const modules = Array.from(extractModules(__dirname + "/src/runtime/modules").entries()).flatMap(makeModule(''));

modules.unshift({
    input: "src/runtime/ublatt.ts",
    output: {
        dir: 'dist',
        format: 'es'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({ "tsconfig": "src/runtime/tsconfig.json"}),
    ]
})

export default modules