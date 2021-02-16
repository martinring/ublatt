import { parser } from './ocl.grammar';
import { LezerLanguage } from '@codemirror/language';
import { styleTags, tags as t } from "@codemirror/highlight";

export default LezerLanguage.define({
  parser: parser.configure({
    props: [ styleTags({
      self: t.self,
      "if then else endif": t.controlKeyword,
      "package endpackage": t.keyword,
      "true false null invalid let in context inv pre post init derive": t.keyword,
      "and or implies xor": t.keyword,
      "Set Bag Sequence Collection OrderedSet Tuple": t.typeName,      
      "OclAny OclInvalid OclMessage OclVoid": t.typeName,
      "Boolean Integer Real String UnlimitedNatural": t.typeName,
      PreMarker: t.special(t.keyword),
      Type: t.typeName,
      SimpleName: t.keyword,
      BlockComment: t.blockComment,
      StringLiteral: t.string,
      NumericLiteral: t.number,
      LineComment: t.lineComment,
      EnumLiteral: t.literal,            
      MethodName: t.function(t.variableName),
      PropertyName: t.propertyName,
      Namespace: t.namespace,
      VariableName: t.definition(t.variableName),
      "( )": t.paren,
      "^ ^^": t.operatorKeyword
    }) ]
  }),
  languageData: {    
  }
})