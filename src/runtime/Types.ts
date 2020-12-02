export interface Modules<A> {
    registerModule(name: string, module: A): void
}

export interface Author {
    name: string,
    matriculation_number: string,
    email: string
}

export interface ExerciseType {
    make(elem: Element, name: string): Exercise
} 

export interface Exercise {
    get: () => any | undefined,
    set: (x: any) => void
}

export interface Solution {
    course?: string,
    sheet?: string,
    authors: Array<Author>,
    solutions: { [id: string]: any; }
}

export interface Ublatt extends Modules<ExerciseType> {        
    addAuthor(): void
    removeAuthor(): void
    save(): void
    load(): void
    clearSheet(): void    
}