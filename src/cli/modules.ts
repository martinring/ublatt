import { existsSync, lstatSync, readdirSync, PathLike }  from 'fs';
import { parse } from 'path';

export type Modules = Map<string,Modules>

export default function extractModules(base: PathLike): Modules {    
    let result = new Map()  
    if (existsSync(base) && lstatSync(base).isDirectory) {
        readdirSync(base).forEach((file) => {
            const p = parse(file)
            if (p.ext == '.ts' || p.ext == '.tsx') {
                let submodules = extractModules(`${base}/${p.name}`)
                result.set(p.name,submodules)                    
            }
        })
    }
    return result
}