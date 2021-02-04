#!/usr/bin/env node
import 'source-map-support/register.js'

import * as process from 'process';
import yargs, { string } from 'yargs';
import build from './build';
import summary from './summary';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import evaluate from './evaluate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));

yargs(process.argv.slice(2))
  .scriptName('ublatt')  
  .options({
    meta: {
      type: "array",
      description: "path to meta yaml file",
      default: [] as string[],
      global: true,
    }
  })
  .command(
    'build [source]',
    'generate interactive exercise sheets',
    (argv) => {
      return argv.options({
        out: {
          alias: 'o',
          type: "string",
          description: "file to write to",
          default: 'stdout'
        },
        standalone: {     
          type: 'boolean',
          default: false
        },
        dataDir: {
          type: "string",
          default: __dirname,
          hidden: true
        }        
      }).positional('source',{
        type: 'string',
        default: 'stdin'
      }).check((args) => {
        if (args.source == 'stdin' && process.stdin.isTTY) {
          throw new Error('nothing to read from stdin')
        } else return true
      })
    },    
    build
  )
  .command(
    'summary [dir]',
    'analyse a directory of handins',
    (argv) => argv.options({
      dir: {
        'type': 'string',
        'default': '.'
      }
    }),
    summary
  )
  .command(
    'evaluate file',
    'evaluate a solution',
    (argv) => argv.options({
      out: {
        alias: 'o',
        type: "string",
        description: "file to write to",
        default: 'stdout'
      },
      file: {
        'type': 'string',
        'required': true  
      },
      dataDir: {
        type: "string",
        default: __dirname,
        hidden: true
      }
    }),
    evaluate
  )
  .demandCommand()
  .help()
  .argv