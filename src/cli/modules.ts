import { existsSync, lstatSync, readdirSync, PathLike }  from 'fs';
import { parse } from 'path';

export type Module = { css: boolean, submodules: Modules }
export type Modules = Map<string,Module>

export default function extractModules(base: PathLike): Modules {    
    let result = new Map()  
    if (existsSync(base) && lstatSync(base).isDirectory) {
        readdirSync(base).forEach((file) => {
            const p = parse(file)
            if (p.ext == '.js' || p.ext == '.ts' || p.ext == '.tsx') {
                let submodules = extractModules(`${base}/${p.name}`)         
                result.set(p.name,{ 
                    submodules: submodules,
                    css: existsSync(`${base}/${p.name}.css`)
                })
            }
        })
    }
    return result
}