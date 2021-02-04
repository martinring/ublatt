import { Solution, Student } from '../shared/Types'
import * as fs from 'fs';
import build, { BuildOptions }  from './build';
import { extractMetadata, Metadata, parseMetadata } from './metadata';

type EvaluateOptions = BuildOptions & {  
  file: fs.PathLike
}

export default function evaluate(options: EvaluateOptions) {  
  function makeBuildOptions(s: Solution): BuildOptions {
    const opts = Object.assign({},options)
    const y = fs.readdirSync('./solutions') // TODO: make search path configurable
      .filter(x => x.endsWith('.json'))
      .map(x => JSON.parse(fs.readFileSync('./solutions/' + x).toString('utf-8')) as Solution)
      .find(x => x.sheet == s.sheet)
    const z = fs.readdirSync('./sheets') // TODO: make search path configurable
      .filter(x => x.endsWith('.md'))
      .map(x => './sheets/' + x).find(x => {
        const meta: Metadata = {}
        extractMetadata(fs.readFileSync(x).toString('utf-8'), meta)
        return meta.sheet == s.sheet
      })
    opts.submission = s
    opts.solution = y
    if (!z) throw new Error("could not find sheet")
    opts.source = z
    return opts
  }
  if (fs.statSync(options.file).isDirectory()) {
    const counters: { [i: string]: number } = { }
    const xs = fs.readdirSync(options.file).filter(x => x.endsWith('.json')).forEach(x => {          
      const c = fs.readFileSync(options.file + '/' + x).toString('utf-8')
      const s = JSON.parse(c) as Solution
      const opts = makeBuildOptions(s)
      const n = counters[s.sheet] = counters[s.sheet] + 1 || 1      
      opts.out = `${options.file}/sheet${s.sheet}-${n}.html`
      build(opts)
    })
  } else {
    const x = fs.readFileSync(options.file).toString('utf-8')
    const s = JSON.parse(x) as Solution
    build(makeBuildOptions(s))
  }
}