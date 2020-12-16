import * as katex from 'katex'
import { InputMode } from '../input'
import { EditorState } from '@codemirror/next/state'
//import { completeSnippets } from '@codemirror/next/autocomplete'


export default class Math implements InputMode {
    render(code: string, elem: HTMLElement, name: string): void {
        katex.render(code,elem)
    }    
    language = [EditorState.globalLanguageData.of({
        closeBrackets: { brackets: ["(", "[", "{"] },
        commentTokens: { line: "%" },
        /*autocomplete: completeSnippets([
            {
                "label": "\\begin{aligned}",
                "snippet": "\\begin{aligned}\n\t${}\n\\end{aligned}",
                "type": "keyword"
            }
        ])*/
    })]
    help = 'https://katex.org/docs/supported.html'
    name = 'LaTeX Math Notation'
}