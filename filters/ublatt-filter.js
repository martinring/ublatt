#!/usr/bin/env node
import extractModules from '../modules.js';
import * as fs from 'fs';
import katex from 'katex';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modules = extractModules(path.parse(__dirname).dir + "/dist/modules");
const tags = new Set(["Span","Div","CodeBlock","Code"])
const include = []

var stdinBuffer = fs.readFileSync(0);
let x = JSON.parse(stdinBuffer.toString())

let procMath = (b) => {
    if (b.t == "Math") {
        b.t = "RawInline"
        const display = b.c[0].t == "DisplayMath"
        const tex = b.c[1]
        b.c = ["html",katex.renderToString(tex,{
            "displayMode": display,
            "trust": true,
            "output": "html"
        })]
    } else if (typeof b.c == "object") b.c.forEach(procMath)
}

let procIncludes = (modules) => { 
    (b) => {
        if (tags.has(b.t) && Object.keys(modules).indexOf()) {
            
        } else if (typeof b.c == "object") b.c.forEach(proc)
    }
}

x.blocks.forEach(procMath)
//x.blocks.forEach(procIncludes(modules))
/*x.meta.include = {
    "t": "MetaList",
    "c": include.map(s => {
        return {
            "t": "MetaString",
            "c": s
        }
    })
}*/
process.stdout.write(JSON.stringify(x))