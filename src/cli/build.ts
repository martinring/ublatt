import * as fs from 'fs';
import * as path from 'path';
import { mergeMetadata, parseMetadata, extractMetadata } from './metadata';
import extractModules, { Modules, Module } from './modules';
import Markdown from './markdown'
import esbuild from 'esbuild';
import { transformAsync } from '@babel/core';
// @ts-ignore
import solid from 'babel-preset-solid';
// @ts-ignore
import ts from '@babel/preset-typescript';
import handlebars from 'handlebars';
import { Solution, Student } from '../shared/Types'
import { readFile } from 'fs/promises'
import { parse } from 'path'
//import * as pack from '../../package.json';

export type BuildOptions = {
  source: string,
  out: string,
  meta?: string[],
  submission?: Solution,
  solution?: Solution,
  standalone: boolean,
  dataDir: string
}

export default async function build(options: BuildOptions) {
    const dir = options.source == 'stdin' ? '.' : path.parse(options.source).dir
    const f = fs.readFileSync(options.source == 'stdin' ? 0 : options.source).toString('utf-8');

    const modules = extractModules(options.dataDir + '/src/runtime/modules');        

    const meta: { [key: string]: any } = {
      "lang": Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0],
      "eval": (options.submission || options.solution) ? true : undefined
    };           

    if (options.meta) {
      options.meta.forEach(x => {
        const src = fs.readFileSync(x).toString('utf-8')
        const m = parseMetadata(src)        
        mergeMetadata(m,meta)        
      })
    }
    
    const markdown = extractMetadata(f,meta);    

    if (options.submission) {
      meta['authors'] = options.submission.authors
    }

    const imports = [
      "import Ublatt from './src/runtime/ublatt'"
    ]

    const imported = new Set<Module>()

    const inits = [
      `const meta = ${JSON.stringify(meta)}`,
      `const ublatt = new Ublatt(document.querySelector('form.ublatt'),meta)`,
      `window.ublatt = ublatt`
    ]  
    
    meta['$css'] = ["./src/runtime/ublatt.css"];

    function findModules(base: string, modules: Modules, classes: string[], parent: string) {
      if (modules.size > 0) {
        classes.forEach(c => {
          const module = modules.get(c)
          if (module) {            
            if (!imported.has(module)) {
              imported.add(module)              
              imports.push(`import ${c.charAt(0).toUpperCase() + c.slice(1)} from '${base}/${c}'`)
              inits.push(`const ${c} = new ${c.charAt(0).toUpperCase() + c.slice(1)}()`)
              inits.push(`${parent}.registerModule('${c}',${c})`)
              if (module.css) {
                meta['$css'].push(base + "/" + c + ".css")
              }
            }
            findModules(base + "/" + c, module.submodules, classes, c)
          }
        })
      }
    }

    const md = new Markdown({
      dir: dir,
      processClasses(x) {
        return findModules("./src/runtime/modules",modules,x,"ublatt")
      },
      standalone: options.standalone
    })
    meta['$body'] = md.render(markdown);
    
    const initArgs = []
    
    if (options.submission) {
      const sub = options.submission
      meta['author'] = sub.authors.map((a: Student) => a.name)
      
      initArgs.push(JSON.stringify(sub))
    }    
    if (options.solution) {
      let solution = options.solution      
      initArgs.push(JSON.stringify(solution))
    }
    inits.push(`ublatt.init(${initArgs.join(", ")})`) 

    const script = imports.join("; ") + ";" + inits.join("; ")       
    const bundle = await esbuild.build({
      stdin: {
        contents: script,
        resolveDir: options.dataDir
      },
      bundle: true,
      platform: "browser",
      format: 'esm',
      write: false,
      plugins: [
        /*{
          name: 'external-cdn',
          setup(build) {
            build.onResolve({ filter: /^katex$/ }, (args) => {
              console.log(args.path)
              return {
                external: true,
                path: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js'
              }
            })
          }
        },*/
        {
          name: "solid",
          setup(build) {
              build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
                  const source = await readFile(args.path, { encoding: 'utf8' });
                  const { name, ext } = parse(args.path)              
                  const filename = name + ext
                  const res = await transformAsync(source, {
                      presets: [solid, ts],
                      filename,
                      sourceMaps: "inline"
                  });
                  return { contents: res?.code || undefined, loader: 'js' }
              })
          }
        }],
      minify: true
    })

    bundle.warnings?.forEach(console.warn)
    
    if (bundle.outputFiles) {
      meta['$script'] = bundle.outputFiles[0].text.replaceAll("</script>","<\\/script>")
    }

    meta['$css'] = meta['$css'].map((x: string) => {
      let alt = x.replace('./src/runtime','./dist')      
      if (fs.existsSync(options.dataDir + '/' + alt)) x = alt      
      if (options.standalone) {
        const p = options.dataDir + '/' + x
        let css = fs.readFileSync(p).toString('utf-8')
        css = css.replaceAll(/url\(['"]?([a-zA-Z\.\/0-9_@-]+)['"]?\)/g,(x,y) => {
          const data = fs.readFileSync(path.parse(p).dir + '/' + y).toString('base64')
          let mime
          switch (path.parse(y).ext) {
            case ('.woff'): mime = 'font/woff'; break;
            case ('.png'): mime = 'image/png'; break;
            case ('.jpg'): mime = 'image/jpg'; break;
            case ('.svg'): mime = 'image/svg+xml'; break;
            default: mime = 'text/plain'; break;
          }
          return `url(data:${mime};base64,${data})`
        })
        return `<style>\n${css}\n</style>`
      } else return `<link rel="stylesheet" href="${x}"/>`
    })

    meta['$dir'] = "dist";

    var pagetitle = "" 
    if (meta['sheet'] !== undefined) pagetitle += meta['sheet'].toString() + (meta.i18n?.["sheet-title"] || ". Übungsblatt") + " - "
    pagetitle += meta['title'] || "ublatt"
    if (meta['subtitle']) pagetitle += " - " + meta['subtitle']
    meta['$pagetitle'] = pagetitle;
    const footerTemplateSrc = fs.readFileSync(options.dataDir + "/templates/submit.html").toString('utf-8')
    const footerTemplate = handlebars.compile(footerTemplateSrc)
    
    if (!options.submission) meta['$footer'] = footerTemplate(meta)

    const templateSrc = fs.readFileSync(options.dataDir + '/templates/ublatt.html').toString('utf-8');
    const template = handlebars.compile(templateSrc)

    if (options.out == 'stdout') {
        process.stdout.write(template(meta))
    } else {
        fs.writeFileSync(options.out, template(meta))
    }
}