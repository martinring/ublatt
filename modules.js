import { existsSync, lstatSync, readdirSync }  from 'fs';
import { parse } from 'path';

function extractModules(base) {    
    let result = new Map()  
    if (existsSync(base) && lstatSync(base).isDirectory) {
        readdirSync(base).forEach((file) => {
            const p = parse(file)
            if (p.ext == '.js' || p.ext == '.ts') {
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

export default extractModules