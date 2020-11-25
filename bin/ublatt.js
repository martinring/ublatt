#!/usr/bin/env node
import MarkdownIt from 'markdown-it';
import mdContainer from 'markdown-it-container';
import { readFileSync } from 'fs';

/** @type { MarkdownIt.Options } */
const options = {
}

const md = new MarkdownIt(options).use(mdContainer,'container',{})

var stdinBuffer = readFileSync(0);
let x = stdinBuffer.toString()

let res = md.render(x)

process.stdout.write(res)