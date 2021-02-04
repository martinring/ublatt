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

export type Renderer = {
  <K extends HTML>(k: K, props: Props<K>, ...children: string[]): any
  when(p: any, t: () => string): any
  empty(): any
  fragment(...items: string[]): any
  fromString(value: string): any
}

//export type Result<K extends HTML, T extends Renderer<K>> = ReturnType<T>
export type Fragment<T extends Renderer> = ReturnType<T['fragment']>
//export type Empty<T extends Renderer<HTML>> = ReturnType<T['empty']>
//export type Child<T extends Renderer<K>, K extends HTML> = Parameters<T>[2]
//export type FragmentChild<T extends Renderer<HTML>> = Parameters<T['fragment']>[0]
//export type Properties<T extends Renderer<K>, K extends HTML> = Parameters<T>[1]

export interface RuntimeRenderer extends Renderer {
  <K extends HTML>(k: K, props: { [X in keyof Props<K>]: Props<K>[X] | RVar<Props<K>[X]> }, ...children: (Node | string)[]): HTMLElementTagNameMap[K]
  when(p: any, t: () => string | Node): Node
  empty(): Node
  fragment(...items: (string | Node)[]): DocumentFragment
  fromString(value: string): DocumentFragment
}

export interface StaticRenderer extends Renderer {
  <K extends HTML>(k: K, props: Props<K>, ...children: string[]): string
  when(p: any, t: () => string): string
  empty(): string
  fragment(...items: string[]): string
  fromString(value: string): string
}
