export interface Modules<A> {
    registerModule(name: string, module: A): void
}

export interface Author {
    name: string,    
    email: string
}

export interface Student extends Author {
    matriculation_number: string
}

export interface ExerciseType<T> {
    make(elem: Element, name: string): Exercise<T>
    render(elem: Element, name: string, value: T): Element
} 

export interface Exercise<T> {
    get: () => T | undefined,
    set: (x: T) => void
}

export interface Solution {
    course: string,
    sheet: string,
    authors: Array<Student>,
    solutions: { [id: string]: any; }
}

export interface Ublatt extends Modules<ExerciseType<any>> {        
    addAuthor(): void
    removeAuthor(): void
    save(): void
    load(): void
    clearSheet(): void
    emailify(): void
    exercises: { [id: string]: Exercise<any> }
}