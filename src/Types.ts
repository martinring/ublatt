export interface Author {
    name: string,
    matriculation_number: string,
    email: string
}

export type ExerciseType<T> = (elem: Element, name: string) => Exercise<T>

export interface Exercise<T> {
    get: () => any | undefined,
    set: (x: any) => void
}

export interface Metadata {
    readonly sheet?: string;
    readonly title?: string;
}

export interface Solution {
    course?: string,
    sheet?: string,
    authors: Array<Author>,
    solutions: { [id: string]: any; }
}

export interface Ublatt {
    registerExerciseType<T>(name: string, constructor: ExerciseType<T>): void
    addAuthor(): void
    removeAuthor(): void
    save(): void
    load(): void
    clearSheet(): void    
}