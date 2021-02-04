// @ts-ignore
import externals from '../../externals.json';
// @ts-ignore
import pack from '../../package.json';

type Dict = { [key: string]: string }

export default {
    filter: RegExp(`^(${Object.keys(externals).join('|')})$`),
    path(key: string): string | undefined {        
        return (externals as Dict)[key].replace(/\$\{\s*version\s*\}/,(pack.dependencies as Dict)[key])
    } 
}