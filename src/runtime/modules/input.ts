import { ExerciseType, Modules } from '../../shared/Types';

import {keymap, highlightSpecialChars, drawSelection, indentOnInput, ViewPlugin, ViewUpdate, EditorView} from "@codemirror/next/view"
import {Extension, EditorState} from "@codemirror/next/state"
import {history, historyKeymap} from "@codemirror/next/history"
import {lineNumbers} from "@codemirror/next/gutter"
import {defaultKeymap} from "@codemirror/next/commands"
import {bracketMatching} from "@codemirror/next/matchbrackets"
import {closeBrackets, closeBracketsKeymap} from "@codemirror/next/closebrackets"
import {searchKeymap} from "@codemirror/next/search"
import {autocompletion, completionKeymap} from "@codemirror/next/autocomplete"
import {commentKeymap} from "@codemirror/next/comment"
import {rectangularSelection} from "@codemirror/next/rectangular-selection"
import {gotoLineKeymap} from "@codemirror/next/goto-line"
import {highlightSelectionMatches} from "@codemirror/next/highlight-selection"
import {defaultHighlighter} from "@codemirror/next/highlight"
import {lintKeymap} from "@codemirror/next/lint"

export interface InputMode {
  render?(code: string, elem: HTMLElement, name: string): void
  language: Extension
  help?: string
  name?: string
}

export default class Input implements ExerciseType<string>, Modules<InputMode> {
  private inputModes: { [id: string]: InputMode } = {}

  registerModule(name: string, mode: InputMode) {
    this.inputModes[name] = mode;
  }

  render(elem: Element, name: string, content: string): Element {    
    let rendered = document.createElement('div');
    rendered.classList.add('rendered','math')
    let tpe = Object.keys(this.inputModes).find((x) => elem.classList.contains(x))
    let inputMode = tpe ? this.inputModes[tpe] : undefined
    if (inputMode && inputMode.render) {      
      inputMode.render(content,rendered,name)
    } else {
      rendered.innerText = content 
    }
    return rendered
  }

  make(elem: Element, name: string) {
    let text = elem.textContent?.trim()
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

      let setup: Extension = [
        lineNumbers(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        EditorView.domEventHandlers({
          "blur": (e) => {
            elem.classList.remove('editing')
          },
          "focus": (e) => {
            elem.classList.add("editing")            
          }
        }),
        indentOnInput(),
        defaultHighlighter,
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        highlightSelectionMatches(),
        keymap([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...commentKeymap,
          ...gotoLineKeymap,
          ...completionKeymap,
          ...lintKeymap
        ])        
      ]

      if (inputMode.render) {
        let render = inputMode.render
        elem.classList.add("rendered")
        let rendered = document.createElement("div");
        rendered.classList.add("rendered");
        elem.appendChild(rendered);
        setup = [setup, ViewPlugin.fromClass(class {
          timeout?: number
          view: EditorView
          constructor(view: EditorView) { this.view = view }          
          update(update: ViewUpdate) {
            if (update.docChanged) {
              if (this.timeout) window.clearTimeout(this.timeout);
                this.timeout = undefined;
                //if (errorMarker) errorMarker.clear();
                //errorMarker = null;
                let before = rendered.innerHTML;
                try {
                  this.view.composing
                  const text = update.state.sliceDoc(0)
                  if (text.trim().length > 0) {
                    render(text, rendered, name);
                  } else {
                    rendered.innerHTML = "";
                  }
                  rendered.classList.remove("error");
                  editorWrapper.classList.remove("error");
                } catch (e) {
                  rendered.innerHTML = before;
                  let show = function () {
                    editorWrapper.classList.add("error");
                    rendered.innerHTML = e.message;
                    rendered.classList.add("error");
                  }
                  if (rendered.classList.contains("error"))
                    show()
                  else
                    this.timeout = window.setTimeout(show, 1000);
                }
            }
          }
        })]
      }
      let editorWrapper = document.createElement("div");
      editorWrapper.classList.add("editor");
      elem.appendChild(editorWrapper);      

      let state = EditorState.create({
        doc: text,
        extensions: [setup,inputMode.language]
      })
      
      let view = new EditorView({
        state: state,
        parent: editorWrapper
      })
            
      if (inputMode.render) {
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
      }

      return {
        get: () => view.state.sliceDoc(0),
        set: (v: string) => {
          if (v != view.state.sliceDoc(0)) view.dispatch({
            changes: [{
              from: 0,
              to: view.state.doc.length,
              insert: v
            }]
          })
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


