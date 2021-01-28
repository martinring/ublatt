import { Exercise, Eval, MultiPartExerciseType } from "../Types";
import Input from './input'
import * as katex from 'katex'
import Prism from 'prismjs'
import 'prismjs/components/prism-latex';


export default class FHC extends MultiPartExerciseType<string> {
  makeAll(elem: Element, name: string): Exercise<string>[] {    
    const regex = /^(\s*){(.*)}\s*$/
    const input = new Input()
    input.registerModule('logic', {      
      highlight(elem) {
        elem.innerHTML = Prism.highlight(elem.textContent || "", Prism.languages['latex'])
      },
      render: (code,elem,name) => {        
        elem.innerHTML = ''
        code.split('\n').forEach(line => {
          const d = document.createElement('div')
          elem.append(d)
          katex.render('\\{\\:' + line + ' \\:\\}',d)
        })
      }
    })
    const lines = elem.textContent?.split('\n')    
    const div = document.createElement('div')
    elem.classList.forEach(x => div.classList.add(x))
    elem.replaceWith(div)    
    elem = div
    const parts: Exercise<string>[] = []
    let cnt = 1    
    lines?.forEach(line => {
      const div = document.createElement('div')
      elem.append(div)
      const match = regex.exec(line)
      if (match) {   
        div.classList.add('indented')     
        const indent = document.createElement('div')
        indent.classList.add('indent')        
        indent.innerHTML = match[1]
        const inp = document.createElement('div')
        inp.classList.add('input','logic')
        div.append(indent,inp)                              
        inp.innerText = match[2]
        parts.push(input.make(inp,name + `.${cnt++}`))
      } else {
        div.classList.add('code')
        div.innerText = line
      }
    })    
    return parts
  }

  eval(elem: Element, name: string, value: Eval<(string | undefined)[]>): Element {
    throw new Error("Method not implemented.")
  }  
}