export interface View<T> {
    readonly elem: Element
    get(): T
    set(x: T): void
}