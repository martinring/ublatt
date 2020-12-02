#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import includepaths from 'rollup-plugin-includepaths';

import Markdown from '../dist/cli/markdown.js'
import * as Metadata from '../dist/cli/metadata.js'

import handlebars from 'handlebars';

import extractModules from '../modules.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

const modules = extractModules(__dirname + '/dist/runtime/modules');

yargs(hideBin(process.argv))
  .command('$0 [input..]', 'Interactive exercise sheet generator', (x) => {
    x.scriptName('ublatt')
     .positional('input', {
        "type": "string",
        "description": "input markdown file (defaults to stdin)"
     })
     .option('standalone',{
       "type": "boolean",
       "default": false
     })
     .option('template',{       
       "default": __dirname + "/templates/ublatt.html"
     })     
     .option('meta',{
       "type": 'array'
     })
  }, async (args) => {        
    
    const f = (args.input || [0]).map(x => fs.readFileSync(x).toString('utf-8')).join('\n\n');
    
    const meta = {
      "lang": Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0],
    };    

    if (args.meta) {
      args.meta.forEach(x => {
        const src = fs.readFileSync(x).toString('utf-8')
        const m = Metadata.parseMetadata(src)        
        Metadata.mergeMetadata(m,meta)        
      })
    }    
    
    const markdown = Metadata.extractMetadata(f,meta);    

    const imports = [
      "import Ublatt from './dist/runtime/ublatt.js'"
    ]    
    const inits = [
      `const meta = ${JSON.stringify(meta)}`,
      `const ublatt = new Ublatt(document.querySelector('form.ublatt'),meta)`,
      `window.ublatt = ublatt`
    ]
 
    meta['$meta-json'] = JSON.stringify(meta);        
    
    meta['$css'] = ["./dist/runtime/ublatt.css"];

    function findModules(base,modules,classes,parent) {
      if (modules.size > 0) {        
        classes.forEach(c => {
          if (modules.has(c)) {
            if (!modules.get(c).imported) {
              modules.get(c).imported = true
              imports.push(`import ${c.charAt(0).toUpperCase() + c.slice(1)} from '${base}/${c}.js'`)
              inits.push(`const ${c} = new ${c.charAt(0).toUpperCase() + c.slice(1)}()`)
              inits.push(`${parent}.registerModule('${c}',${c})`)
              if (modules.get(c).css) {
                meta['$css'].push(base + "/" + c + ".css")
              }
            }
            findModules(base + "/" + c, modules.get(c).submodules, classes, c)
          }
        })
      }
    }

    const md = new Markdown(x => findModules("./dist/runtime/modules",modules,x,"ublatt"))
    meta['$body'] = md.render(markdown);
    inits.push('ublatt.init()') 

    meta['$script'] = imports.join("; ") + ";" + inits.join("; ")

    if (args.standalone) {
      const bundle = await rollup({
        input: "index",
        plugins: [
          virtual({
            'index': meta['$script'],            
          }),
          includepaths({
            include: {},
            paths: [__dirname, '.'],
            external: [],
            extensions: ['.js']
          })
        ]
      })      
      const { output } = await bundle.generate({
        file: 'dist/runtime/index.js',
        format: 'iife'
      });
      meta['$script'] = output[0].code      
    }     

    meta['$dir'] = "dist";

    var pagetitle = "" 
    if (meta['sheet'] !== undefined) pagetitle += meta['sheet'].toString() + (meta.i18n?.["sheet-title"] || ". Übungsblatt") + " - "
    pagetitle += meta['title'] || "ublatt"
    if (meta['subtitle']) pagetitle += " - " + meta['subtitle']
    meta['$pagetitle'] = pagetitle;
    const footerTemplateSrc = fs.readFileSync(__dirname + "/templates/submit.html").toString('utf-8')
    const footerTemplate = handlebars.compile(footerTemplateSrc)

    meta['$footer'] = footerTemplate(meta)

    const templateSrc = fs.readFileSync(args.template).toString('utf-8');
    const template = handlebars.compile(templateSrc)

    process.stdout.write(template(meta))    
  }).argv