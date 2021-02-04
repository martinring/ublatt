
import { StaticRenderer, HTML, Props } from "../shared/templates/template";

const voidTags = new Set<HTML>([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr'])

export const renderer: StaticRenderer = Object.assign(
  function <K extends HTML>(k: K, props: Props<K>, ...children: string[]): string {
    const attrs = Object.entries(props).map(([k,v]) => {
      switch (k) {
        case 'attributes':
          return Object.entries(v).map(([k,v]) => `${k}="${v}"`).join(' ')
        case 'data':
          return Object.entries(v).map(([k,v]) => `data-${k}="${v}"`).join(' ')
        case 'class':
          return `class="${Array.isArray(v) ? v.join(' ') : v}"`
        default:
          return `${k.toLowerCase()}="${v}"`        
      }
    }).join(' ')
    if (children.length == 0 && voidTags.has(k)) {    
      return `<${k} ${attrs}/>`
    } else {
      return `<${k} ${attrs}>\n${children.join('')}\n</${k}>`
    }
  },
  {
    fragment(...items: string[]) {
      return items.join('')
    },    
    fromString(v: string) {
      return v
    },
    empty() { return '' },
    when(p: any, t: () => string) {
      return p ? t() : ''
    } 
  }
)

export default function render(template: (r: StaticRenderer) => string) {
  return template(renderer)
}