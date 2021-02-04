import * as katex from 'katex'
import { InputMode } from '../input'
import { stexMath } from '@codemirror/legacy-modes/mode/stex'
import { StreamLanguage } from "@codemirror/stream-parser"
//import { completeSnippets } from '@codemirror/next/autocomplete'


export default class Math implements InputMode {
    render(code: string, elem: HTMLElement, name: string): void {
        katex.render(code,elem)
    }
    help = 'https://katex.org/docs/supported.html'
    name = 'LaTeX Math Notation'
    language = [
        StreamLanguage.define(stexMath)
    ]
}