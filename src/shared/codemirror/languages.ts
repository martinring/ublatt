import { Language } from "@codemirror/language"

const languages: { [lang: string]: () => Promise<Language> } = {
  javascript: () => import("@codemirror/lang-javascript").then(x => x.javascriptLanguage),
  typescript: () => import("@codemirror/lang-javascript").then(x => x.typescriptLanguage),
  jsx: () => import("@codemirror/lang-javascript").then(x => x.jsxLanguage),
  tsx: () => import("@codemirror/lang-javascript").then(x => x.tsxLanguage),
  python: () => import("@codemirror/lang-python").then(x => x.pythonLanguage),
  cpp: () => import("@codemirror/lang-cpp").then(x => x.cppLanguage),
  css: () => import("@codemirror/lang-css").then(x => x.cssLanguage),
  markdown: () => import('@codemirror/lang-markdown').then(x => x.markdownLanguage),
  ocl: () => import('../languages/ocl').then(x => x.default)
}

languages.py = languages.python
languages.ts = languages.typescript
languages.js = languages.javascript

export default languages