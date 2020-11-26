#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { fileURLToPath } from 'url';
import markdownit from 'markdown-it';
import container from 'markdown-it-container';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import bspans from 'markdown-it-bracketed-spans';
import attrs from 'markdown-it-attrs';
import secs from 'markdown-it-header-sections';

import handlebars from 'handlebars';

import extractModules from '../modules.js';

import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

const modules = extractModules(__dirname + '/dist/modules');

function extractMetadata(input,meta) {
  const lines = input.split('\n')
  var start = null
  var blank = true
  var i = 0
  var buf = ""
  while (i < lines.length) {
    if (typeof start == "number") {        
      if (lines[i].match(/^(---|...)\s*$/)) {
        try {
          const x = yaml.parse(buf)
          Object.keys(x).forEach(key => {
            meta[key] = x[key]
          })
          lines.splice(start,i-start + 1)
        } catch (e) {                     
          i = i - (i - start + 1)
        }
        start = null
        blank = false
        buf = ""
      } else {
        buf += lines[i] + "\n"
      }
    } else {
      if (blank && lines[i].match(/^---\s*$/)) {
        start = i
      } else if (lines[i].match(/^\s*$/)) {
        blank = true
      } else {
        blank = false
      }
    }
    i += 1;
  }
  return lines.join('\n');
}

yargs(hideBin(process.argv))
  .command('$0 [input..]', 'Interactive exercise sheet generator', (x) => {
    x.scriptName('ublatt')
     .positional('input', {
        "type": "string",
        "description": "input markdown file (defaults to stdin)"
     })
     .option('template',{
       "default": __dirname + "/templates/ublatt.html2"
     })
     .option('meta',{
       "type": 'array'
     })
  }, (args) => {        
    const f = (args.input || [0]).map(x => fs.readFileSync(x).toString('utf-8')).join('\n\n');
    const meta = {
      "lang": Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0]
    };    
    if (args.meta) {
      args.meta.forEach(x => {
        const src = fs.readFileSync(x).toString('utf-8')
        const m = yaml.parse(src)
        Object.keys(m).forEach(k => { 
          meta[k] = m[k]
        })
      })
    }
    const markdown = extractMetadata(f,meta);
    meta['$meta-json'] = JSON.stringify(meta);    
    meta['$js'] = { "dist/ublatt.js" : true };
    meta['$css'] = { "dist/ublatt.css" : true };

    function findModules(base,modules,classes) {
      if (modules.size > 0) {        
        classes.forEach(c => {
          if (modules.has(c)) {            
            meta['$js'][base + "/" + c + ".js"] = true
            if (modules.get(c).css) {
              meta['$css'][base + "/" + c + ".css"] = true
            }
            findModules(base + "/" + c, modules.get(c).submodules, classes)
          }
        })
      }
    }

    const md = markdownit()
      .use(container, 'classes', {
        validate(params) {
          return params.trim().match(/^(\w+\s+)*\w+$/)
        },
        render(tokens, idx) {
          const classes = tokens[idx].info.trim().split(/\s+/)    
          findModules("dist/modules",modules,classes);
          if (tokens[idx].nesting === 1) {
            // opening tag
            return `<div class="${classes.join(' ')}">\n`;
          } else {
            // closing tag
            return '</div>\n';
          }
        }
      })
      .use(texmath, { engine: katex, delimiters: 'dollars' })
      .use(bspans)
      .use(attrs)
      .use(secs)

    const renderAttrs = md.renderer.renderAttrs

    md.renderer.renderAttrs = function(tkn) {
      if (tkn.attrs) {
        const c = tkn.attrs.find(x => x && x[0] == "class")
        if (c) {
          const classes = c[1].split(/\s+/);          
          findModules("dist/modules",modules,classes);
        }
      }
      return renderAttrs(tkn)
    }    

    md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      const token = tokens[idx];
      return  '<pre' + slf.renderAttrs(token) + '>'
        + '<code>' + token.content + '</code>'
        + '</pre>';
    }

    meta['$body'] = md.render(markdown);           
    meta['$dir'] = "dist";
    meta['$pagetitle'] = meta['sheet'] + (meta.i18n?.["sheet-title"] || ". Übungsblatt") + " - " + meta['title'] + " " + meta['subtitle'];
    const templateSrc = fs.readFileSync(args.template).toString('utf-8');
    const template = handlebars.compile(templateSrc)
    process.stdout.write(template(meta))    
  }).argv