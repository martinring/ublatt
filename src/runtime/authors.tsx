import { Student } from './Types';
import { createState } from 'solid-js';
import { render, For } from 'solid-js/dom';

export class Authors {
  readonly get: () => Student[]
  readonly set: (students: Student[]) => void

  constructor(elem: Element, authors?: Student[]) {
    const  [state,setState] = createState({
      authors: authors || []
    })

    this.get = () => state.authors
    this.set = (authors) => setState({authors: authors})

    function addAuthor(author?: Student): void {
      setState({
        authors: [
          ...state.authors,
          author || {
            name: "",
            matriculation_number: "",
            email: ""
          }
        ]
      })
    }

    function removeAuthor(i: number): void {
      setState('authors',(t) => {                
        const then = [...t.slice(0,i),...t.slice(i+1)]
        return then.length > 0 ? then : [{ name: "", matriculation_number: "", email: "" }]
      })
    }    
    
    render(() => 
      <>
        <table class="authors">
          <thead>
              <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Matrikelnummer</th>
                  <th>Email</th>
                  <th></th>
              </tr>
          </thead>
          <tbody>
            <For each={state.authors}>
              {(author,i) => {
                const { name, matriculation_number, email } = author
                return <tr>
                  <td>{i() + 1}</td>
                  <td><span class='field' onInput={(e) => setState('authors', i(), { name: e.target.textContent || "" } )} contenteditable>{name}</span></td>
                  <td><span class='field' onInput={(e) => setState('authors', i(), { matriculation_number: e.target.textContent || "" } )} contenteditable>{matriculation_number}</span></td>
                  <td><span class='field' onInput={(e) => setState('authors', i(), { email: e.target.textContent || "" } )} contenteditable>{email}</span></td>
                  <td><a class='icon' hidden={state.authors.length <= 1} onClick={ (e) => removeAuthor(i()) }><i class="icon-minus"></i></a></td>
                </tr>
              }}
            </For>
          </tbody>
        </table>
        <p class="center">
          <a class="icon" onClick={() => addAuthor()}><i class="icon-plus"></i></a>
        </p>
      </>,
      elem)
  }
}