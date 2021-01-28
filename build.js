#!/usr/bin/env node
import esbuild from 'esbuild';
import solid from 'babel-preset-solid';
import { transformAsync } from '@babel/core';
import ts from '@babel/preset-typescript';
import { readFile } from 'fs/promises'
import { parse } from 'path'

export default esbuild.build({
    "entryPoints": [
        "src/runtime/ublatt.tsx",
        "src/runtime/modules/input.ts"
    ],
    "outdir": "dist",
    "platform": "browser",
    "format": "esm",
    "bundle": true,
    "plugins": [{
      name: "solid",
      setup(build) {
          build.onLoad({ filter: /\.(tj)sx$/ }, async (args) => {
              const source = await readFile(args.path, { encoding: 'utf8' });
              const { name, ext } = parse(args.path)              
              const filename = name + ext
              const { code } = await transformAsync(source, {
                  presets: [solid, ts],
                  filename,
                  sourceMaps: "inline"
              });
              return { contents: code, loader: 'js' }
          })
      }      
    }, {
        name: 'extenal',
        setup(build) {            
            build.onResolve({                
                filter: /^[^\./].*$/ 
            }, args => {                
                console.log(args.path)             
            })
        }
    }]
})