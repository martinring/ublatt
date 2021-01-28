import fs from 'fs/promises';
import pathOps, { ParsedPath } from 'path';
import esbuild from 'esbuild';
import { X_OK } from 'constants';

interface RuntimeBuildOptions {
    standalone: boolean,
    imports: string[],
    inits: string[],
    args: string[],
    resolveDir: string
}

const defaultOptions: RuntimeBuildOptions = {
    standalone: false,
    imports: [],
    inits: [],
    args: [],
    resolveDir: '.'
}

export class RuntimeModule {
    private path: string
    private css?: Promise<string | null>
    private submodules?: Promise<RuntimeModule[]>
    private active = false
    private pathInfo: ParsedPath

    constructor(path: string) {
        this.path = path  
        this.pathInfo = pathOps.parse(path)
    }

    getSubmodules(): Promise<RuntimeModule[]> {
        if (!this.submodules) {            
            this.submodules = fs.readdir(this.pathInfo.dir + pathOps.sep + this.pathInfo.name).then(
                ok => ok.map(p => new RuntimeModule(p)),
                () => []
            )
        }
        return this.submodules
    }

    getActiveSubmodules(): Promise<RuntimeModule[]> {
        if (this.submodules) {
            return this.submodules.then(x => x.filter(y => y.active))
        } else {
            return Promise.resolve([])
        }
    }

    getPath(): string {
        return this.path
    }

    getCSSPath(): Promise<string | null> {
        if (!this.css) {            
            const cssp = this.pathInfo.base + pathOps.sep + this.pathInfo.name + '.css'
            this.css = fs.stat(cssp).then(
                ok => ok.isFile() ? cssp : null,
                () => null
            )
        }
        return this.css
    }

    setActive(active: boolean = true) {
        this.active = active
    }

    async build(options: Partial<RuntimeBuildOptions>): Promise<string | undefined> {
        const ids: { [id: string]: number } = { }
        const submodules = await this.getActiveSubmodules()
        function mkId(n: string, cls?: boolean): string {
            if (cls) n = n.charAt(0).toUpperCase() + n.slice(1)
            const i = ids[n] | 0
            ids[n] = i
            return n + (i > 0 ? "_" + i.toString() : "")
        }
        const id = mkId(this.pathInfo.name)
        const Id = mkId(this.pathInfo.name,true)
        const imports = (options.imports || []).concat([
          `import ${Id} from '${this.path}'`
        ])
        
        const inits = (options.inits || []).concat([
          `const ${id} = new ${Id}(${options.args?.join(",")})`          
        ])
        const proc = async (m: RuntimeModule, p: string) => {            
          const id = mkId(m.pathInfo.name)
          const Id = mkId(m.pathInfo.name,true)
          imports.push(`import ${Id} from '${m.pathInfo.base}/${m.pathInfo.name}`)
          inits.push(`const ${id} = new ${Id}()`)
          inits.push(`${p}.registerModule('${m.pathInfo.name}',${id})`)
          const s = await m.getActiveSubmodules()
          await Promise.all(s.map(m => proc(m,id)))
        }
        await Promise.all(submodules.map(m => proc(m,id)))
        inits.push(`${id}.init()`)
        
        const bundle = await esbuild.build({
            stdin: {
                contents: imports.join("; ") + ";" + inits.join("; "),
                resolveDir: options.resolveDir
            },
            bundle: true,
            platform: "browser",
            format: "iife",
            write: false,
            minify: true
        })
        bundle.warnings?.forEach(console.warn)
        
        if (bundle.outputFiles) {
            return bundle.outputFiles[0].text.replaceAll("</script>","<\\/script>")            
        } else {
            return undefined
        }        
    }

    async buildCSS(options: Partial<RuntimeBuildOptions>): Promise<string> {
        return Promise.reject('not implemented')
    }
}