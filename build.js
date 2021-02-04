#!/usr/bin/env node
import esbuild from 'esbuild';
import { readdirSync } from 'fs';

esbuild.build({
    "entryPoints": ["src/cli/ublatt.ts"],
    "bundle": true,
    "outfile": "bin/ublatt.js",
    "external": readdirSync('node_modules'),
    "platform": "node",
    "format": "esm",
    "sourcemap": true,
    "plugins": []
})