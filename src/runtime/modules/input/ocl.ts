import { InputMode } from '../input'
import { lineNumbers } from '@codemirror/gutter'

import { parser } from '../../../shared/languages/ocl.grammar';
import { LezerLanguage } from '@codemirror/language';
import { styleTags, tags as t } from "@codemirror/highlight";

export default class OCL implements InputMode {
  language = [
    lineNumbers(),
    LezerLanguage.define({
      parser: parser.configure({
        props: [
          styleTags({
            Keyword: t.keyword,
            ControlKeyword: t.controlKeyword,
            IntegerLiteral: t.number
          })
        ]
      }),
      languageData: {        
      }
    })
  ]
}