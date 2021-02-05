import type { Author } from '../Types'
import type { Renderer, Fragment } from './template'

export default function <T extends Renderer> (props: {
  lang: string
  authors: Author[]
  pagetitle: string
  script: string
  style: string
  header?: Fragment<T>
  body: Fragment<T>
  footer?: Fragment<T>
}) {
  return (h: T) =>
    h.fragment(
      h.fromString('<!DOCTYPE html>'),
      h('html',{ lang: props.lang },  
        h('head',{},
          h('meta', { name: 'generator', content: 'ublatt' }),          
          h('meta', { attributes: { charset: 'utf-8' }}),
          h.fragment(...props.authors.map(a => h('meta',{ name: 'author', content: a.name }))),
          h('title',{},props.pagetitle),
          h('script',{ type: 'module' },props.script),
          h('style',{},props.style)
        ),
        h('body',{},
          h('form',{ class: 'ublatt' },
            props.header,
            h('div',{ class: 'main' }, props.body),
            props.footer
          )
        )
      )  
    )
}