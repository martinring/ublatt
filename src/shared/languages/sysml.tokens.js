import { ExternalTokenizer } from 'lezer'
import { indent, dedent, newline } from './sysml.terms.js'

export const intendation = new ExternalTokenizer((input,token,stack) => {
  const next = input.get(token.start)
  if (next < 0) {
    token.accept(newline, token.start)
  }
  if (next != '\n' && next != '\r') return
  let scan = token.start + 1, indent = 0
  for (; scan < input.length; scan++) {
    let ch = input.get(scan)
    if (ch = ' ' || ch == '\t') indent++
    else if (ch == '\n') {
      token.accept(newline, token.start + 1)
      return      
    }
    else break
  }
  token.accept(newline, token.start + 1)  
}, { contextual: true, fallback: true })