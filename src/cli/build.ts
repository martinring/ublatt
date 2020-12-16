import * as fs from 'fs';
import * as path from 'path';
import { Metadata, mergeMetadata, parseMetadata, extractMetadata } from './metadata';
import extractModules, { Modules, Module } from './modules';
import Markdown from './markdown'
import esbuild from 'esbuild';
import handlebars from 'handlebars';
import { Author } from '../shared/Types'

type BuildOptions = {
  source: string,
  out: string,
  meta?: string[],
  submission?: string,
  solution?: string,
  standalone: boolean,
  dataDir: string
}

export default function build(options: BuildOptions) {    
    const f = fs.readFileSync(options.source == 'stdin' ? 0 : options.source).toString('utf-8');

    const modules = extractModules(options.dataDir + '/src/runtime/modules');        

    const meta: Metadata = {
      "lang": Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0],
    };           

    if (options.meta) {
      options.meta.forEach(x => {
        const src = fs.readFileSync(x).toString('utf-8')
        const m = parseMetadata(src)        
        mergeMetadata(m,meta)        
      })
    }
    
    const markdown = extractMetadata(f,meta);    

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

    const md = new Markdown(x => findModules("./src/runtime/modules",modules,x,"ublatt"))
    meta['$body'] = md.render(markdown);
    
    const initArgs = []
    
    if (options.submission) {
      let submission = fs.readFileSync(options.submission).toString('utf-8')
      const sub = JSON.parse(submission)
      meta['author'] = sub.authors.map((a: Author) => a.name)
      initArgs.push(submission)
    }    
    if (options.solution) {
      let solution = fs.readFileSync(options.solution).toString('utf-8')
      JSON.parse(solution)      
      initArgs.push(solution)
    }
    inits.push(`ublatt.init(${initArgs.join(", ")})`) 

    const script = imports.join("; ") + ";" + inits.join("; ")    
    const bundle = esbuild.buildSync({
      stdin: {
        contents: script,
        resolveDir: options.dataDir
      },
      bundle: true,
      platform: "browser",
      format: "iife",
      write: false,
      minify: true
    })
    bundle.warnings?.forEach(console.warn)
    
    if (bundle.outputFiles) {
      meta['$script'] = bundle.outputFiles[0].text.replaceAll("</script>","<\\/script>")
    }

    meta['$css'] = meta['$css'].map((x: string) => {
      let alt = x.replace('./src/runtime','./dist')      
      if (fs.existsSync(alt)) x = alt
      console.log(x)
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