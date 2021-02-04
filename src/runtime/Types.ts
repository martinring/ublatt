
import { Exercise, Student } from '../shared/Types'
export { Exercise, Author, Solution, Student } from '../shared/Types'

export interface Eval<T> {
    submission: T
    solution: T
    mark(elem: Element, feedback: DocumentFragment): void
}

export interface ExerciseType<T> {
    make(elem: Element, name: string): Exercise<T>
    eval(elem: Element, name: string, value: Eval<T>): Element
} 

export abstract class MultiPartExerciseType<T> implements ExerciseType<(T | undefined)[]> {
    abstract makeAll(elem: Element, name: string): Exercise<T>[]
    make(elem: Element, name: string): Exercise<(T | undefined)[]> {
        const all = this.makeAll(elem, name)
        return {
            get: () => all.map(e => e.get()),
            set: (v) => v.forEach((v,i) => v ? all[i].set(v) : {})
        }
    }
    abstract eval(elem: Element, name: string, value: Eval<(T | undefined)[]>): Element
}

export interface Modules<A> {
    registerModule(name: string, module: A): void
}

export interface Ublatt extends Modules<ExerciseType<any>> {        
    save(): void
    load(): void
    clearSheet(): void
    emailify(): void
    /*getAuthors(): Student[]
    setAuthors(authors: Student[]): void*/
}