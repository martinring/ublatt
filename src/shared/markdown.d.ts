import marked from 'marked';
export declare class Renderer extends marked.Renderer {
    codespan(code: string): string;
}
export declare class Tokenizer extends marked.Tokenizer {
    codespan(src: string): marked.Tokens.Codespan;
}
export declare const options: marked.MarkedOptions;
