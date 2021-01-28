export interface Author {
    name: string,    
    email: string
}

export interface Student extends Author {
    matriculation_number: string
}


export interface Exercise<T> {
    get: () => T | undefined,
    set: (x: T) => void,
    points?: number
}

export interface Solution {
    course: string,
    sheet: string,
    authors: Array<Student>,
    solutions: { [id: string]: any; }
}