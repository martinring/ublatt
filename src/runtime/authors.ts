import { Student } from './Types';
import render from './render';

export function Authors(elem: Element, authors: Student[] = []) {
  return render(µ => {
    const authorViews: ({ setIndex(i: number): void, get(): Student, remove(): void })[] = []
    const tbody = µ('tbody', {})

    function addAuthor(i: number, s: Student) {
      const indexCol = µ('td', {}, (i + 1).toString())
      const nameField = µ('span', { class: 'field', contentEditable: 'true' }, s.name)
      const matnrField = µ('span', { class: 'field', contentEditable: 'true' }, s.matriculation_number)
      const emailField = µ('span', { class: 'field', contentEditable: 'true' }, s.email)
      const row = µ('tr', {},
        indexCol,
        µ('td', {}, nameField),
        µ('td', {}, matnrField),
        µ('td', {}, emailField)
      )
      tbody.appendChild(row)
      authorViews.push({
        setIndex(i: number) {
          indexCol.textContent = (i + 1).toString()
        },
        get() {
          return {
            name: nameField.textContent || '',
            matriculation_number: matnrField.textContent || '',
            email: emailField.textContent || ''
          }
        },
        remove() {
          row.remove()
        }
      })
    }

    function removeAuthor() {
      authorViews.splice(-1)[0].remove()
    }

    const frag = µ.fragment(
      µ('table', { class: 'authors' },
        µ('thead', {},
          µ('tr', {},
            µ('th', {}, "#"),
            µ('th', {}, "Name"),
            µ('th', {}, "Matrikelnummer"),
            µ('th', {}, "Email")
          )
        ),
        tbody
      ),
      µ('p', { class: 'center' },
        µ('a', { class: 'icon', events: { click: () => addAuthor(authorViews.length, { name: '', matriculation_number: '', email: '' }) } }, µ('i', {}, '➕')),
        µ('a', { class: 'icon', events: { click: () => removeAuthor() } }, µ('i',{},'➖'))
      )
    )

    elem.replaceWith(frag)

    return {
      get: () => authorViews.map(v => v.get()),
      set: (v: Student[]) => {
        authorViews.splice(0, authorViews.length)
        v.forEach((s, i) => addAuthor(i, s))
      }
    }
  })
}