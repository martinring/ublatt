import * as katex from 'katex'
import 'codemirror/mode/stex/stex.js'

//@ts-expect-error
window.ublatt.registerInputMode('math',{
    render: (x, elem) => katex.render(x,elem),
    language: {
        name: 'stex',
        inMathMode: true
    },
    name: 'LaTeX Math Notation',
    help: 'https://katex.org/docs/supported.html'
})