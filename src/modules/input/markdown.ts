import MarkdownIt from 'markdown-it'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/gfm/gfm.js'

const md = new MarkdownIt();

// @ts-expect-error
ublatt.registerInputMode('markdown',{
    render: (x, elem) => {
        elem.innerHTML = md.render(x)
    },
    language: {
        name: 'gfm',
    },
    name: 'Github Flavoured Markdown',
    help: 'https://github.github.com/gfm/'
})