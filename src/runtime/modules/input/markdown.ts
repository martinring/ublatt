import MarkdownIt from 'markdown-it'
import { InputMode } from '../input';

export default class MarkdownMode implements InputMode {
    readonly md: MarkdownIt;

    constructor() {
        this.md = new MarkdownIt()
    }
    
    public render(x: string, elem: Element) {
        elem.innerHTML = this.md.render(x)
    }

    public language = []

    public name = 'Github Flavoured Markdown'
    public help = 'https://github.github.com/gfm/'
}