import { StreamLanguage } from '@codemirror/next/stream-parser'

type OCLParseState = {

}

StreamLanguage.define<OCLParseState>({
  startState() {
    return {}
  },
  token(stream,state): string {      
    if (stream.eatSpace()) {
      return "whitespace"
    }    
  }
})