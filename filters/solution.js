#!/usr/bin/env node
import extractModules from '../modules.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var stdinBuffer = fs.readFileSync(0);
let x = JSON.parse(stdinBuffer.toString())

process.argv

process.stdout.write(JSON.stringify(x))