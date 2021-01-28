import MarkdownIt from 'markdown-it'
import { InputMode } from '../input';

const md: MarkdownIt = MarkdownIt()

export default class MarkdownMode implements InputMode {    
     render(x: string, elem: Element) {
        elem.innerHTML = md.render(x)
     }     
     name = 'Github Flavoured Markdown'
     help = 'https://github.github.com/gfm/'
}