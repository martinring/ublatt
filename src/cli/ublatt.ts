#!/usr/bin/env node
import * as process from 'process';
import yargs, { string } from 'yargs';
import build from './build';
import summary from './summary';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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
  .demandCommand()
  .help()
  .argv
  
  /*
  })


    
    
    'summary [dir]', "", (x) => {
      x.positional('dir', {
        "type": "string",
        "default": "."
      })
    }, (args) => {      
    }    
  )
  .command('build [input..]', 'Interactive exercise sheet generator', (x) => {
    x.positional('input', {
        "type": "string",
        "description": "input markdown file (defaults to stdin)"
     })
     .option('standalone',{
       "type": "boolean",
       "default": false
     })
     .option('solution',{
       "type": "string"
     })
     .option('submission',{
       "type": "string"
     })
     .option('template',{       
       "default": __dirname + "/templates/ublatt.html"
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
      "import Ublatt from './src/runtime/ublatt'"
    ]
    const inits = [
      `const meta = ${JSON.stringify(meta)}`,
      `const ublatt = new Ublatt(document.querySelector('form.ublatt'),meta)`,
      `window.ublatt = ublatt`
    ]  
    
    meta['$css'] = ["./dist/ublatt.css"];

    function findModules(base,modules,classes,parent) {
      if (modules.size > 0) {        
        classes.forEach(c => {
          if (modules.has(c)) {
            if (!modules.get(c).imported) {
              modules.get(c).imported = true
              imports.push(`import ${c.charAt(0).toUpperCase() + c.slice(1)} from '${base}/${c}'`)
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

    const md = new Markdown(x => findModules("./src/runtime/modules",modules,x,"ublatt"))
    meta['$body'] = md.render(markdown);
    
    const initArgs = []
    
    if (args.submission) {
      let submission = fs.readFileSync(args.submission).toString('utf-8')
      const sub = JSON.parse(submission)
      meta['author'] = sub.authors.map(a => a.name)
      initArgs.push(submission)
    }    
    if (args.solution) {
      let solution = fs.readFileSync(args.solution).toString('utf-8')
      JSON.parse(solution)      
      initArgs.push(solution)
    }
    inits.push(`ublatt.init(${initArgs.join(", ")})`) 

    const script = imports.join("; ") + ";" + inits.join("; ")    
    const bundle = esbuild.buildSync({
      stdin: {
        contents: script,
        resolveDir: __dirname
      },
      bundle: true,
      platform: "browser",
      format: "esm",
      write: false,
      minify: true
    })
    bundle.warnings?.forEach(console.warn)
    
    if (bundle.outputFiles) {
      meta['$script'] = bundle.outputFiles[0].text.replaceAll("</script>","<\\/script>")
    }

    meta['$css'] = meta['$css'].map(x => { 
      if (args.standalone) {
        const p = __dirname + '/' + x
        let css = fs.readFileSync(p).toString('utf-8')
        css = css.replaceAll(/url\(['"]?([a-zA-Z\.\/0-9]+)['"]?\)/g,(x,y) => {
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
    const footerTemplateSrc = fs.readFileSync(__dirname + "/templates/submit.html").toString('utf-8')
    const footerTemplate = handlebars.compile(footerTemplateSrc)
    
    if (!args.submission) meta['$footer'] = footerTemplate(meta)

    const templateSrc = fs.readFileSync(args.template).toString('utf-8');
    const template = handlebars.compile(templateSrc)

    process.stdout.write(template(meta))
  }).argv*/