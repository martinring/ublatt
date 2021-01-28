import marked from 'marked';

export class Renderer extends marked.Renderer {
    codespan(code: string): string {
        return super.codespan(code)
    }
}

export class Tokenizer extends marked.Tokenizer {
    codespan(src: string): marked.Tokens.Codespan {
        const match = /^\$(([^\$]|\\\$)*[^\\])\$/.exec(src)
        if (match) {
            return {
               type: "codespan",
               raw: match[0],
               text: match[1].trim()
            }
        } else return super.codespan(src)
    }
}

export const options: marked.MarkedOptions = {
    "gfm": true,
    "headerIds": true,
    "sanitize": true
}