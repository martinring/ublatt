import { Exercise, ExerciseType, Eval } from "../Types";

function renderList(elems: Iterable<Node>): DocumentFragment {
  const fragment = document.createDocumentFragment()    
  Array.from(elems).forEach((node,i,a) => {
    if (i != 0) {
      if (i == a.length - 1) {        
        fragment.append(' und ')
      } else {
        fragment.append(', ')
      }
    }
    fragment.append(node)
  })
  return fragment
}

function tableBodyRows(table: HTMLTableElement): Array<HTMLTableRowElement> {  
  return Array.from(table.tBodies).flatMap(body => Array.from(body.rows))
}

function extractGroups(table: HTMLTableElement, grouped: boolean): Array<Array<HTMLTableDataCellElement>> {
  let groupElems: Array<Array<HTMLTableDataCellElement>> = [];
  if (grouped) {
    groupElems = tableBodyRows(table).map((row) => {            
      return Array.from(row.cells)
    })
    
  } else {
    groupElems = [tableBodyRows(table).flatMap(row => Array.from(row.cells))]
  }
  groupElems = groupElems.map(group => group.filter((elem) => {
    if (elem.innerText == '-') {            
      return false
    }
    return elem.innerText.trim() == ''
  }))
  return groupElems
}

export default class Choice implements ExerciseType<boolean[] | boolean[][]> {
  public eval(elem: Element, name: string, value: Eval<boolean[] | boolean[][]>): Element {
    let container = elem.children.item(0)
    if (container) {
      if (container.tagName == 'TABLE') {                       
        const cheaders = Array.from(container.querySelectorAll("thead > tr > th")).slice(1).map(e => {
          const span = document.createElement('span')
          span.innerHTML = e.innerHTML
          return span
        })

        const grouped = container.classList.contains('grouped')
        
        const rheaders = Array.from(container.querySelectorAll("tbody > tr > td:first-child")).map((e,i) => {          
          const div = document.createElement('div')
          const span = document.createElement('span')
          span.classList.add('mute')
          span.innerHTML = e.innerHTML
          div.appendChild(span)
          div.appendChild(document.createTextNode(": "))          
          let crow: boolean[] = []
          if (grouped) {
            crow = value.submission[i] as boolean[]
          } else {
            crow = (value.submission[0] as boolean[]).splice(0,cheaders.length)
          }
          const hs = cheaders.filter((e,i) => {
            return crow[i]
          }).map(e => e.cloneNode(true))
          if (hs.length == 0)
            div.appendChild(document.createTextNode("keine Antwort"))
          else div.appendChild(renderList(hs))
          return div
        })

        const res = document.createElement('div')
        res.append(...rheaders)

        return res
      } else if (container.tagName == 'UL' || container.tagName == 'OL') {
        const single = elem.classList.contains('single')
        const elems = document.createElement(single ? 'div' : container.tagName)
        Array.from(container.querySelectorAll('li')).forEach((x: HTMLLIElement,i) => {
          if (value.submission[i]) {
            if (single) {
              elems.append(...Array.from(x.childNodes).map(x => x.cloneNode(true) as Element))
            } else {
              elems.append(x.cloneNode(true) as Element)
            }
          }
        })
        return elems
      } else {        
        throw new Error('choice does not contain ul, ol or table element')
      }
    } else {
      throw new Error('choice does not contain ul, ol or table element')
    }
}

  public make(elem: Element, name: string): Exercise<boolean[] | boolean[][]> {
    let container = elem.children.item(0)
    if (container) {
      if (container.tagName == 'TABLE') {
        let groupElems: Array<Array<HTMLTableDataCellElement>> = [];
        if (elem.classList.contains('grouped')) {
          groupElems = Array.from(container.querySelectorAll('tbody tr')).map((row) => {
            return Array.from(row.querySelectorAll('td'))
          })
        } else {
          groupElems = [Array.from(container.querySelectorAll('tbody td'))]
        }
        groupElems = groupElems.map(group => group.filter((elem) => {
          if (elem.innerText == '-') {
            elem.classList.add('disabled')
            return false
          }
          return elem.innerText.trim() == ''
        }))
        let groups = groupElems.map((group, i) => {
          let groupName = name + '-' + i
          let choices = group.map((choice, i) => {
            let cb = document.createElement('input')
            cb.type = elem.classList.contains('single') ? 'radio' : 'checkbox'
            cb.name = groupName
            cb.id = groupName + "-" + i
            let label = document.createElement('label')
            let description = document.createElement('div')
            description.classList.add('description')
            label.appendChild(description)
            label.htmlFor = cb.id
            description.innerHTML = choice.innerHTML
            choice.innerHTML = ""
            choice.appendChild(cb)
            choice.appendChild(label)
            return {
              get: () => cb.checked,
              set: (o: boolean) => cb.checked = o
            }
          })
          return {
            get: () => choices.map((x) => x.get()),
            set: (x: Array<boolean>) => x.forEach((x, i) => choices[i].set(x))
          }
        })
        return {
          get: () => groups.map((x) => x.get()),
          set: (x: boolean[] | boolean[][]) => x.forEach((x: boolean | boolean[], i: number) => groups[i].set(typeof x == "boolean" ? [x] : x))
        }
      } else if (container.tagName == 'UL' || container.tagName == 'OL') {
        // coice list                                 
        let choices = Array.from(container.querySelectorAll('li')).map((choice, i) => {
          let cb = document.createElement('input')
          cb.type = elem.classList.contains('single') ? 'radio' : 'checkbox'
          cb.name = name
          cb.id = name + "-" + i
          let label = document.createElement('label')
          let description = document.createElement('div')
          description.classList.add('description')
          label.appendChild(description)
          label.htmlFor = cb.id
          description.innerHTML = choice.innerHTML
          choice.innerHTML = ""
          choice.appendChild(cb)
          choice.appendChild(label)
          return {
            get: () => cb.checked,
            set: (o: boolean) => cb.checked = o
          }
        })
        return {
          get: () => choices.map((x) => x.get()),
          set: (x: boolean[] | boolean[][]) => 
            x.forEach((x: boolean | boolean[], i : number) => 
              typeof x == "boolean" ? choices[i].set(x) : x.forEach((x,i) => choices[i].set(x)))
        }
      } else {
        console.error("choice does not contain ul, ol or table element")
        return {
          get: () => undefined,
          set: () => { }
        }
      }
    } else {
      console.error("choice does not contain ul, ol or table element")
      return {
        get: () => undefined,
        set: () => { }
      }
    }
  }
}