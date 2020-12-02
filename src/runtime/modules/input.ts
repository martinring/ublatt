import { ExerciseType, Modules } from '../Types';

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
  render(code: string, elem: HTMLElement, name: string): void
  language: Extension
  help: string
  name: string
}

export default class Input implements ExerciseType, Modules<InputMode> {
  private inputModes: { [id: string]: InputMode } = {}

  registerModule(name: string, mode: InputMode) {
    this.inputModes[name] = mode;
  }

  make(elem: Element, name: string) {
    let text = elem.textContent?.trim()
    elem.innerHTML = ""
    let tpe = Object.keys(this.inputModes).find((x) => elem.classList.contains(x))
    if (tpe) {
      let inputMode = this.inputModes[tpe]
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

      const setup: Extension = [
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
        ]),
        ViewPlugin.fromClass(class {
          timeout?: number           
          constructor(view: EditorView) {  }          
          update(update: ViewUpdate) {
            if (update.docChanged) {
              if (this.timeout) window.clearTimeout(this.timeout);
                this.timeout = undefined;
                //if (errorMarker) errorMarker.clear();
                //errorMarker = null;
                let before = rendered.innerHTML;
                try {
                  view.composing
                  const text = update.state.sliceDoc(0)
                  if (text.trim().length > 0) {
                    inputMode.render(text, rendered, name);
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
        })
      ]

      let state = EditorState.create({
        doc: text,
        extensions: [setup]
      })      
      let view = new EditorView({
        state: state,                
        parent: editorWrapper
      })

      /*let editor = CodeMirror(editorWrapper, {
        value: text,
        mode: inputMode.language,
        viewportMargin: Infinity
      })*/
      editorWrapper.addEventListener("transitionend", function () {
        if (elem.classList.contains("editing")) {
          view.focus()
          view.update([])
        }
      });
      //let errorMarker: TextMarker | null = null;
      let timeout: number | null = null;

      /*editor.on("change", (function () {
        
      }))*/
      elem.addEventListener("click", function () {
        {
          elem.classList.add("editing");
        }
      })/*
      editor.on('focus', function (e) {
        {
          elem.classList.add("editing");
        }
      })
      try {
        if (editor.getValue().trim().length > 0) {
          inputMode.render(editor.getValue(), rendered, name);
        }
      } catch (e) {
        editorWrapper.classList.add("error");
        rendered.innerHTML = e.message;
        rendered.classList.add("error");
      }*/
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


