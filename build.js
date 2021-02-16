#!/usr/bin/env node
import esbuild from 'esbuild';
import { readdirSync } from 'fs';
import { readFile } from 'fs/promises'
import { buildParserFile } from 'lezer-generator';

esbuild.build({
    "entryPoints": ["src/cli/ublatt.ts"],
    "bundle": true,
    "outfile": "bin/ublatt.js",
    "external": readdirSync('node_modules'),
    "platform": "node",
    "format": "esm",
    "sourcemap": true,
    "plugins": [
        {
            name: "lezer",
            setup(build) {
              build.onLoad({ filter: /\.grammar$/ }, async (args) => { 
                const source = await readFile(args.path, { encoding: 'utf-8' });
                const { parser } = buildParserFile(source, {
                })
                return {
                  contents: parser,
                  loader: 'js'
                }
              })
            }
        }
    ]
})