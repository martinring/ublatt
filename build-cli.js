#!/usr/bin/env node
import { dirname } from 'path';
import esbuild from 'esbuild';
import { readdirSync } from 'fs';

export default esbuild.build({
    "entryPoints": ["src/cli/ublatt.ts"],
    "bundle": true,
    "outfile": "bin/ublatt.js",
    "external": readdirSync('node_modules'),
    "platform": "node",
    "format": "esm"
})