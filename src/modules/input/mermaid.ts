import Mermaid from 'mermaid';

Mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  /*themeVariables: {
    fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',  
    primaryColor: '#ffffff',
    primaryBorderColor: '#000000'
  }*/
})

// @ts-expect-error
window.ublatt.registerInputMode('mermaid',{
      language: "mermaid",
      render: (x,elem,name) => Mermaid.render(name,x,(svg) => {
        elem.innerHTML = svg;      
      }),
      name: 'Mermaid.js',
      help: 'https://mermaid-js.github.io'
  })