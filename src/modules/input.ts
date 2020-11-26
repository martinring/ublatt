import CodeMirror, { TextMarker } from 'codemirror';

let inputModes: { [id: string]: InputMode } = { }

interface InputMode {
  render(code: string, elem: HTMLElement, name: string): void
  language: any
  help: string
  name: string
}

declare module "../Types" {
  interface Ublatt {
    registerInputMode?(name: string, mode: InputMode): void
  }
}

if (!window.ublatt) {
  console.error("ublatt is not defined")
} else {
  window.ublatt.registerInputMode = (name, mode) => {
      inputModes[name] = mode;
  }

  window.ublatt.registerExerciseType('input', function (elem,name) {            
      let text = elem.textContent?.trim()
      elem.innerHTML = ""
      let tpe = Object.keys(inputModes).find((x) => elem.classList.contains(x))
      if (tpe) {
          let inputMode = inputModes[tpe]
          elem.classList.add("rendered")
          let help = document.createElement('div')
          help.classList.add('help')
          help.dataset["name"] = tpe
          let link = document.createElement('a')
          link.target = '_blank'
          link.innerHTML = inputMode.name
          link.href = inputMode.help
          help.appendChild(link)
          elem.appendChild(help)
          let rendered = document.createElement("div");                
          rendered.classList.add("rendered");
          let editorWrapper = document.createElement("div");
          editorWrapper.classList.add("editor");        
          elem.appendChild(rendered);
          elem.appendChild(editorWrapper);
          let editor = CodeMirror(editorWrapper,{
            value: text,
            mode: inputMode.language,
            viewportMargin: Infinity          
          })
          editorWrapper.addEventListener("transitionend",function() {
              if (elem.classList.contains("editing")) {
                  editor.focus()
                  editor.refresh()
              }
          });
          editor.on("blur",function(e) {                                            
              elem.classList.remove("editing")
          })            
          let errorMarker: TextMarker | null = null;
          let timeout: number | null = null; 
                
          editor.on("change", (function() {                                                        
            if (timeout) window.clearTimeout(timeout);
            timeout = null;
            if (errorMarker) errorMarker.clear();
            errorMarker = null;
            let before = rendered.innerHTML;
            try {
              if (editor.getValue().trim().length > 0) {
                inputMode.render(editor.getValue(),rendered,name);
              } else {
                rendered.innerHTML = "";
              }                    
              rendered.classList.remove("error");
              editorWrapper.classList.remove("error");
            } catch(e) {
              rendered.innerHTML = before;
              let show = function() {
                editorWrapper.classList.add("error");
                rendered.innerHTML = e.message;
                rendered.classList.add("error");
              }
              if (rendered.classList.contains("error"))
                show()
              else 
                timeout = window.setTimeout(show, 1000);
            }
          }))
          elem.addEventListener("click",function(e) { 
            {          
              elem.classList.add("editing");          
          } })
          editor.on('focus',function(e) { 
            {
              elem.classList.add("editing");          
          } })
          try {
            if (editor.getValue().trim().length > 0) {
              inputMode.render(editor.getValue(),rendered,name);
            }
          } catch (e) {
            editorWrapper.classList.add("error");
            rendered.innerHTML = e.message;
            rendered.classList.add("error");
          }
          return {
              get: () => editor.getValue(),
              set: (v) => editor.setValue(v)
          }
      } else {
          elem.classList.add("default")
          let rendered = document.createElement("div");
          rendered.classList.add("rendered");
          elem.appendChild(rendered);
          let editor = document.createElement("textarea");                
          editor.rows = 1;
          elem.appendChild(editor);
          const resize = () => {
            if ((editor.value.split("\n").pop() || "").trim().length == 0) 
              rendered.innerText = editor.value + ".";        
            else 
              rendered.innerText = editor.value;
          }
          editor.oninput = resize;
          resize();
          return {
              get: () => editor.value,
              set: (x) => editor.value = x
          }
      }   
  })
} 