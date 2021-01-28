import { onMount } from 'solid-js';
import { ExerciseType, Modules, Eval } from '../Types';

import { CodeJar } from 'codejar';

type CodeJarOptions = {
  tab: string;
  indentOn: RegExp;
  spellcheck: boolean;
  addClosing: boolean;
};

const defaultCodeJarOptions: Partial<CodeJarOptions> = {
  tab: '  ',
  spellcheck: false
}

export interface InputMode {
  render?(code: string, elem: HTMLElement, name: string): void
  highlight?(elem: HTMLElement): void
  language?: Partial<CodeJarOptions>
  help?: string
  name?: string
}

export default class Input implements ExerciseType<string>, Modules<InputMode> {
  private inputModes: { [id: string]: InputMode } = {}

  registerModule(name: string, mode: InputMode) {
    this.inputModes[name] = mode;
  }

  eval(elem: Element, name: string, value: Eval<string>): Element {    
    let rendered = document.createElement('div');
    rendered.classList.add('rendered','math')
    let tpe = Object.keys(this.inputModes).find((x) => elem.classList.contains(x))
    let inputMode = tpe ? this.inputModes[tpe] : undefined
    if (inputMode && inputMode.render) {      
      inputMode.render(value.submission,rendered,name)
    } else if (inputMode) {
      const pre = document.createElement('pre')
      if (tpe) pre.classList.add(tpe)
      const code = document.createElement('code')  
      code.innerText = value.submission
      pre.appendChild(code)          
      rendered.appendChild(pre)
    } else {
      rendered.innerText = value.submission
    }
    return rendered
  }

  make(elem: Element, name: string) {
    let text = elem.textContent
    elem.innerHTML = ""
    let tpe = Object.keys(this.inputModes).find((x) => elem.classList.contains(x))
    let inputMode = tpe ? this.inputModes[tpe] : undefined
    if (inputMode) {  
      if (inputMode.name) {          
        let help = document.createElement('div')
        help.classList.add('help')
        help.dataset["name"] = tpe      
        let link = document.createElement('a')
        link.target = '_blank'
        link.innerHTML = inputMode.name
        if (inputMode.help) link.href = inputMode.help
        help.appendChild(link)
        elem.appendChild(help)
      }      
    
      let editorWrapper = document.createElement("div");
      editorWrapper.classList.add("editor");
      elem.appendChild(editorWrapper);      

      const view = CodeJar(
        editorWrapper,
        inputMode.highlight || (() => {}),
        Object.assign({},defaultCodeJarOptions,inputMode.language)        
      )
      

      editorWrapper.addEventListener('blur',() => elem.classList.remove('editing'))
      editorWrapper.addEventListener('focus',() => elem.classList.add('editing'))                      

      let set = (text: string) => view.updateCode(text)      

      if (inputMode.render) {
        let timeout: undefined | number

        const updateRendered = function(text: string) {
          if (timeout) window.clearTimeout(timeout);
          timeout = undefined;
          //if (errorMarker) errorMarker.clear();
          //errorMarker = null;
          let before = rendered.innerHTML;
          try {                              
            if (text.trim().length > 0) {
              render(text, rendered, name);
            } else {
              rendered.innerHTML = "";
            }
            rendered.classList.remove("error");
            editorWrapper.classList.remove("error");
          } catch (e) {
            console.warn(e)
            rendered.innerHTML = before;
            let show = function () {
              editorWrapper.classList.add("error");
              rendered.innerHTML = e.message;
              rendered.classList.add("error");
            }
            if (rendered.classList.contains("error"))
              show()
            else
              timeout = window.setTimeout(show, 1000);
          }
        }
        let render = inputMode.render
        elem.classList.add("rendered")
        let rendered = document.createElement("div");
        rendered.classList.add("rendered");
        elem.appendChild(rendered);
        view.onUpdate((text) => {      
          updateRendered(text)    
        })
        set = (text) => {
          view.updateCode(text)
          updateRendered(text)
        }
        editorWrapper.addEventListener("transitionend", function () {
          if (elem.classList.contains("editing")) {
            editorWrapper.focus()
          }
        });
        elem.addEventListener("click", function () {
          {
            elem.classList.add("editing");
          }
        })   
      }
          
      set(text || "")

      elem.dispatchEvent(new Event('keyup',{}))

      return {
        get: () => view.toString(),
        set
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
        set: (x: string) => editor.value = x
      }
    }
  }
}


