import './input.css';

import { ExerciseType, Modules, Eval } from '../Types';
import { EditorView, keymap, ViewPlugin } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { standardKeymap } from '@codemirror/commands';
import { history, historyKeymap } from '@codemirror/history';
import { defaultHighlightStyle } from '@codemirror/highlight';

export interface InputMode {
  render?(code: string, elem: HTMLElement, name: string): void
  language?: Extension
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
      
      const setup: Extension[] = [
        keymap.of(standardKeymap),
        history(), keymap.of(historyKeymap),        
        defaultHighlightStyle,
        EditorView.theme({
          $scroller: {
            fontFamily: 'JetBrains Mono',
            fontSize: '80%'            
          },
          $gutters: {
            color: '#237893'
          }          
        })
      ]
      
      if (inputMode.language) setup.push(inputMode.language)

      if (inputMode.render) {
        let timeout: undefined | number

        const updateRendered = function(text: string) {
          if (timeout) window.clearTimeout(timeout);
          timeout = undefined;
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
        editorWrapper.addEventListener("transitionend", function () {
          if (elem.classList.contains("editing")) {
            view.focus()
          }
        });
        elem.addEventListener("click", function () {
          {
            elem.classList.add("editing");
          }
        })

        setup.push(EditorView.domEventHandlers({
          "focus": (e) => elem.classList.add('editing'),
          "blur": (e) => elem.classList.remove('editing')
        }))

        setup.push(ViewPlugin.define(view => {
          return {
            update(update) {
              if (update.docChanged) updateRendered(update.state.sliceDoc())
            }
          } 
        }))
      }

      const state = EditorState.create({
        doc: text || '',
        extensions: setup
      })
     
      const view = new EditorView({
        state, parent: editorWrapper
      })      
                
      elem.dispatchEvent(new Event('keyup',{}))

      return {
        get: () => view.state.sliceDoc(),
        set: (v: string) => {
          if (view.state.sliceDoc() != v) {
            view.dispatch({
              changes: [{
                from: 0,
                to: view.state.doc.length,
                insert: v
              }]
            })
          }
        }
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


