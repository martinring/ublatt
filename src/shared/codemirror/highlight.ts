import { HighlightStyle, tags } from '@codemirror/highlight'

export default HighlightStyle.define(
  {
    tag: tags.link,
    textDecoration: "underline"
  },
  {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: tags.function(tags.variableName),
    color: "#795e26"
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic"
  },
  {
    tag: tags.strong,
    fontWeight: "bold"
  },
  {
    tag: tags.keyword,
    color: "#00f"
  },
  {
    tag: tags.controlKeyword,
    color: "#af00db"
  },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: "#219"
  },
  {
    tag: [tags.literal, tags.inserted],
    color: "#098658"    
  },
  {
    tag: [tags.string, tags.deleted],
    color: "#a31515"
  },
  {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: "#e40"
  },
  {
    tag: tags.definition(tags.variableName),
    color: "#0070c1"
  },
  {
    tag: tags.local(tags.variableName),
    color: "#30a"
  },
  {
    tag: [tags.typeName, tags.namespace],
    color: "#267f99"
  },
  {
    tag: tags.className,
    color: "#267f99"
  },
  {
    tag: [tags.special(tags.variableName), tags.macroName, tags.local(tags.variableName)],
    color: "#256"
  },
  {
    tag: tags.propertyName,
    color: "#001080"
  },  
  { 
    tag: tags.definition(tags.propertyName),
    color: "#001080"
  },
  {
    tag: tags.comment,
    color: "#008000"
  },
  {
    tag: tags.meta,
    color: "#7a757a"
  },
  {
    tag: tags.invalid,
    color: "#f00"
  }
)