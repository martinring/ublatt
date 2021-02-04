import { RuntimeRenderer, Props, HTML, RVar } from "../shared/templates/template";


const renderer: RuntimeRenderer = 
  Object.assign(
    function <K extends HTML>(k: K, props: { [X in keyof Props<K>]: Props<K>[X] | RVar<Props<K>[X]> }, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
      const node = document.createElement(k) as HTMLElementTagNameMap[K]
      Object.entries(props).forEach(([k,v]) => {
        switch (k) {
          case 'attributes':
            Object.entries(v as {}).forEach(([k,v]) => node.setAttribute(k,`${v}`))
            break;
          case 'data':
            // @ts-ignore
            Object.entries(v).forEach(([k,v]) => node.dataset[k] = `${v}`)
            break;
          case 'class':
            if (Array.isArray(v)) {
              node.classList.add(...v)
            } else {
              // @ts-ignore 
              node.classList.add(v)
            }
            break;
          case 'events':
            // @ts-ignore
            Object.entries(v).forEach(([k,v]) => node.addEventListener(k,v as EventListenerOrEventListenerObject))
            break;
          default:
            // @ts-ignore
            node[k] = v
        }
      })
      node.append(...children)
      return node
    },{
      fragment(...items: (Node | string)[]) {
        const fragment = document.createDocumentFragment()
        fragment.append(...items)
        return fragment
      },

      empty: () => document.createDocumentFragment(),
      
      fromString(v: string) {
        const c = document.createElement('div')
        c.innerHTML = v
        const fragment = document.createDocumentFragment()
        fragment.append(...Array.from(c.childNodes))
        return fragment
      },
      
      when(p: any, t: () => string | Node) {        
        if (p) {
          const x = t()
          if (typeof x == 'string') {
            return document.createTextNode(x)
          } else {
            return x
          }
        } else {
          return document.createDocumentFragment()
        }        
      } 
    })

export { renderer };

export default function render<T>(template: (r: RuntimeRenderer) => T): T {
  return template(renderer)
}

/*type RVar<T> = {
  get(): T
  set(v: T): void
  listen(f: (v: T) => void): () => void
}

export function RVar<T>(initial: T): RVar<T> {
  let value = initial
  const listeners = new Set<(v: T) => void>()
  return {
    get() { return value },
    set(v) {
      value = v
      listeners.forEach(f => f(v))      
    },
    listen(f) {
      listeners.add(f)
      return () => listeners.delete(f)
    }
  }
}

type RenderedArray<T> = {
  push(value: T): number
  splice(start: number, deleteCount: number, ...items: T[]): T
}

export function RenderedArray<T>(a: T[], f: (t: T, i: RVar<number>, arr: RenderedArray<T>) => HTMLElement): RenderedArray<T> {
  const items = a
  const indices = a.map((v,i) => RVar(i))  
  const res: RenderedArray<T> = {
    push(v) {            
      return indices.push(RVar(items.push(v) - 1))
    },
    splice(start,del,...items) {
      
      const removed = a.splice(start,del,...items)

      return items.splice(i,1)[0]
    }
  }

}*/