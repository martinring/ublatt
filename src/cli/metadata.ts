import yaml from 'yaml';
import { readFile } from 'fs/promises';
import { Author } from '../shared/Types';

export type Metadata = {
  sheet?: string;
  title?: string;
  lang?: string;
  author?: Author[];
  [id: string]: any;
}

export function loadMetadata(path: string | string[]): Promise<Metadata> {
  if (typeof path == "string") {
    return readFile(path).then(x => x.toString('utf-8')).then(yaml.parseDocument)
  } else {
    return path.map(loadMetadata).reduce(async (a,b) => {
      const a_ = await a
      const b_ = await b
      return mergeMetadata(a_,b_)
    })
  }
}

export function parseMetadata(input: string): Metadata {
  return yaml.parse(input)
}

/** merges all properties set in `from` to `to` */
export function mergeMetadata(from: Metadata, to: Metadata): Metadata {
  Object.keys(from).forEach(key => {
    to[key] = from[key]
  })
  return to
}

/** extracts metadata blocks from input */
export function extractMetadata(input: string, meta: Metadata): string {  
  const lines = input.split('\n')
  var start = null
  var blank = true
  var i = 0
  var buf = ""
  while (i < lines.length) {    
    if (typeof start == "number") {
      if (lines[i].match(/^(---|...)\s*$/)) {
        try {
          const x = parseMetadata(buf)
          Object.keys(x).forEach(key => {
            meta[key] = x[key]
          })
          lines.splice(start, i - start + 1)
        } catch (e) {
          console.warn(e)
          i = i - (i - start + 1)
        }
        start = null
        blank = false
        buf = ""
      } else {
        buf += lines[i] + "\n"
      }
    } else {
      if (blank && lines[i].match(/^---\s*$/)) {
        start = i
      } else if (lines[i].match(/^\s*$/)) {
        blank = true
      } else {
        blank = false
      }
    }
    i += 1;
  }
  return lines.join('\n');
}
