import { InputMode } from '../input'
import { lineNumbers } from '@codemirror/gutter'
import ocl from '../../../shared/languages/ocl'

export default class OCL implements InputMode {
  language = [
    lineNumbers(),ocl    
  ]
}