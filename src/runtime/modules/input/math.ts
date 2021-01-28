import * as katex from 'katex'
import { InputMode } from '../input'
//import { completeSnippets } from '@codemirror/next/autocomplete'


export default class Math implements InputMode {
    render(code: string, elem: HTMLElement, name: string): void {
        katex.render(code,elem)
    }    
    help = 'https://katex.org/docs/supported.html'
    name = 'LaTeX Math Notation'
}