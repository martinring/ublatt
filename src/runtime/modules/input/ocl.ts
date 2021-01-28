import { InputMode } from '../input'

export default class OCL implements InputMode {
    language = {
      indentOn: /(:|\b(and|or|not|implies))\s*$/
    }

    highlight(code: HTMLElement) {
        code.innerHTML = code.textContent?.replace(/\b(context|def|inv|pre|post|self|if|then|else|endif|let|in|implies|and|not|or)\b/g, '<span class="keyword">$1</span>') || ""        
    }
}