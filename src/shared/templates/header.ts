import { Author } from '../Types'
import type { Renderer, HTML } from './template'

export default function<T extends Renderer>(props: {
  title?: string  
  subtitle?: string
  authors?: Author[]
  sheet?: string
  date?: string
  due?: string
}) {
  return (h: T) => 
    h('div',{ class: 'head' },
      h.when(props.title, () => h('span',{ class: 'title' },props.title)),
      h.when(props.subtitle, () => h('span',{ class: 'term' },props.subtitle)),
      h('ul',{ class: 'lecturers' },
        ...(props.authors || []).map(a => h('li',{},a.name))
      ),
      h.when(props.sheet, () => h('span',{ class: 'sheetnum' },`${props.sheet}. Übungsblatt`)),    
      h.when(props.date, () => h.fragment(
        h('span',{ class: 'issued-title' }, 'Ausgabe: '),
        h('span',{ class: 'issued' }, props.date)
      )),
      h.when(props.due, () => h.fragment(
        h('span',{ class: 'due-title' }, 'Abgabe: '),
        h('span',{ class: 'due' }, props.due)
      ))  
    )
}