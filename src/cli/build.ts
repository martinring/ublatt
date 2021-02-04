import * as fs from 'fs';
import * as path from 'path';
import { mergeMetadata, parseMetadata, extractMetadata } from './metadata';
import extractModules, { Modules } from './modules';
import Markdown from './markdown'
import esbuild from 'esbuild';
import { Solution, Student } from '../shared/Types';
import { readFile } from 'fs/promises';
import externals from './externals';
import Main from '../shared/templates/main';
import Header from '../shared/templates/header';
import Submit from '../shared/templates/submit';
import render from './render';
import { buildParserFile } from 'lezer-generator';

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
      lang: Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0],
      eval: (options.submission || options.solution) ? true : undefined
    };           

    if (options.meta) {
      options.meta.forEach(x => {
        const src = fs.readFileSync(x).toString('utf-8')
        const m = parseMetadata(src)        
        mergeMetadata(m,meta)        
      })
    }
    
    const markdown = extractMetadata(f,meta);

    meta.author = meta.author || []

    var pagetitle = "" 
    if (meta['sheet'] !== undefined) pagetitle += meta['sheet'].toString() + (meta.i18n?.["sheet-title"] || ". Übungsblatt") + " - "
    pagetitle += meta['title'] || "ublatt"
    if (meta['subtitle']) pagetitle += " - " + meta['subtitle']

    if (options.submission) {
      meta['authors'] = options.submission.authors
    }

    const imports = [
      "import Ublatt from './src/runtime/ublatt'"
    ]

    const imported = new Set<string>()

    const inits = [
      `const meta = ${JSON.stringify(meta)}`,
      `const ublatt = new Ublatt(document.querySelector('form.ublatt'),meta)`,
      `window.ublatt = ublatt`
    ]  
    
    function findModules(base: string, modules: Modules, classes: string[], parent: string) {
      if (modules.size > 0) {
        classes.forEach(c => {          
          const submodules = modules.get(c)          
          if (submodules) {   
            const path = `${base}/${c}`         
            if (!imported.has(path)) {
              imported.add(path)
              imports.push(`import ${c.charAt(0).toUpperCase() + c.slice(1)} from '${path}'`)
              inits.push(`const ${c} = new ${c.charAt(0).toUpperCase() + c.slice(1)}()`)
              inits.push(`${parent}.registerModule('${c}',${c})`)
            }
            findModules(base + "/" + c, submodules, classes, c)
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

    const body: string = md.render(markdown);
    
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

    let script: string = imports.join("; ") + ";" + inits.join("; ")  
    let style: string = ''     

    const bundle = await esbuild.build({
      stdin: {
        contents: script,
        resolveDir: options.dataDir
      },
      bundle: true,
      platform: "browser",
      format: 'esm',
      outdir: options.dataDir + '/dist',
      write: false,
      loader: {
        '.woff': 'dataurl',
        '.svg': 'dataurl'        
      },
      plugins: [
        {
          name: 'externals',
          setup(build) {
            build.onResolve({ filter: externals.filter }, (args) => {              
              return {
                external: true,
                path: externals.path(args.path) 
              }
            })
          }
        },
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
        }],
      minify: true
    })

    bundle.warnings?.forEach(console.warn)        

    if (bundle.outputFiles) {
      script = bundle.outputFiles[0].text.replaceAll("</script>","<\\/script>")
      style = bundle.outputFiles[1].text
    }

    /*meta['$css'] = meta['$css'].map((x: string) => {
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
    })*/

    meta['$dir'] = "dist";

    //const footerTemplateSrc = fs.readFileSync(options.dataDir + "/templates/submit.html").toString('utf-8')
    //const footerTemplate = handlebars.compile(footerTemplateSrc)
    
    //if (!options.submission) meta['$footer'] = footerTemplate(meta)


    //const templateSrc = fs.readFileSync(options.dataDir + '/templates/ublatt.html').toString('utf-8');
    //const template = handlebars.compile(templateSrc)

    const footer: string = render(µ => µ.when(!options.submission, () => Submit({ buttons: 'submit-buttons' })(µ)))

    meta.authors = meta.authors || meta.author.map((x: string) => ({name: x}))

    const output = render(Main({
      lang: meta.lang,
      authors: meta.authors || [],
      pagetitle, 
      header: render(Header(meta)),
      body,
      script,
      style,
      footer
    }))

    if (options.out == 'stdout') {
        process.stdout.write(output)
    } else {        
        fs.writeFileSync(options.out, output)
    }
}