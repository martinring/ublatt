type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

type Writable<T> = Pick<T, WritableKeys<T>>

type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

type ExcludedProps = 'className'

type WritableNonFunctionProps<T extends HTML> =
  { [K in Exclude<NonFunctionKeys<Writable<HTMLElementTagNameMap[T]>>,ExcludedProps>]: HTMLElementTagNameMap[T][K] }

export type HTML = keyof HTMLElementTagNameMap

export interface RVar<T> extends EventTarget {
}

export type Props<T extends HTML> =
  { [K in keyof WritableNonFunctionProps<T>]?: WritableNonFunctionProps<T>[K] } & {
    class?: string | Array<string>
    attributes?: { [key: string]: string | boolean | number }
    data?: { [key: string]: string | boolean | number }
    events?: Partial<{ [K in keyof HTMLElementEventMap]: (this: HTMLElementTagNameMap[T], e: HTMLElementEventMap[K]) => void }>
  }

type FragmentTag = never
type EmptyTag = never
type Tagged<_K extends HTML | FragmentTag, V> = V

export type Renderer = {
  <K extends HTML>(k: K, props: Props<K>, ...children: string[]): Tagged<K,any>
  when<T extends HTML | FragmentTag>(p: any, t: () => Tagged<T,string>): Tagged<T | EmptyTag,any>
  empty(): Tagged<EmptyTag,any>
  fragment(...items: string[]): Tagged<FragmentTag,any>
  fromString(value: string): Tagged<HTML,any>
}

export type Fragment<T extends Renderer> = ReturnType<T['fragment']>
//export type Result<K extends HTML, T extends Renderer<K>> = ReturnType<T>
//export type Empty<T extends Renderer<HTML>> = ReturnType<T['empty']>
//export type Child<T extends Renderer<K>, K extends HTML> = Parameters<T>[2]
//export type FragmentChild<T extends Renderer<HTML>> = Parameters<T['fragment']>[0]
//export type Properties<T extends Renderer<K>, K extends HTML> = Parameters<T>[1]

export interface RuntimeRenderer extends Renderer {
  <K extends HTML>(k: K, props: { [X in keyof Props<K>]: Props<K>[X] | RVar<Props<K>[X]> }, ...children: (Node | string)[]): Tagged<K,HTMLElementTagNameMap[K]>
  when<T extends HTML | FragmentTag>(p: any, t: () => Tagged<T, string | Node>): Tagged<T | EmptyTag, DocumentFragment | Node | Text>
  empty(): Tagged<EmptyTag,DocumentFragment>
  fragment(...items: (string | Node)[]): Tagged<FragmentTag,DocumentFragment>
  fromString(value: string): Tagged<FragmentTag,DocumentFragment>
}

export interface StaticRenderer extends Renderer {
  <K extends HTML>(k: K, props: Props<K>, ...children: string[]): string
  when(p: any, t: () => string): string
  empty(): string
  fragment(...items: string[]): string
  fromString(value: string): string
}
