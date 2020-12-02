import MermaidAPI from 'mermaid';
import { InputMode } from '../input';

MermaidAPI.initialize({
  startOnLoad: false,
  theme: "default",
  /*themeVariables: {
    fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',  
    primaryColor: '#ffffff',
    primaryBorderColor: '#000000'
  }*/
})

export default class Mermaid implements InputMode {
  language = []
  render(x: string, elem: Element, name: string) {
    MermaidAPI.render(name, x, (svg: string) => {
      elem.innerHTML = svg;
    })
  }
  name = 'Mermaid.js'
  help = 'https://mermaid-js.github.io'
}