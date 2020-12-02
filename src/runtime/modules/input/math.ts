import * as katex from 'katex'
import { InputMode } from '../input'

export default class Math implements InputMode {
    render(code: string, elem: HTMLElement, name: string): void {
        katex.render(code,elem)
    }
    language = []
    help = 'https://katex.org/docs/supported.html'
    name = 'LaTeX Math Notation'
}