declare namespace pandoc {
  interface Pandoc {
    blocks: Block[]
    meta: Meta
    "pandoc-api-version": number[]
  }

  type Meta = { [id: string]: MetaValue }

  type MetaValue =
    { t: "MetaMap", c: Meta } |
    { t: "MetaList", c: MetaValue[] } |
    { t: "MetaBool", c: boolean } |
    { t: "MetaString", c: string } |
    { t: "MetaInlines", c: Inline[] } |
    { t: "MetaBlocks", c: Block[] }

  type ListAttributes = [number, ListNumberStyle, ListNumberDelim]

  type ListNumberStyle =
    "DefaultStyle" | 
    "Example" |
    "Decimal" |
    "LowerRoman" |
    "UpperRoman" |
    "LowerAlpha" |
    "UpperAlpha"

  type ListNumberDelim =
    "DefaultDelim" |
    "Period" |
    "OneParen" |
    "TwoParens"

  type Attr = [string, string[], [string, string][]]

  type Format = string

  type Alignment = 
    "AlignLeft" |
    "AlignRight" |
    "AlignCenter" |
    "AlignDefault"

  type ColWidth = 
    { t: "ColWidth", c: number } |
    { t: "ColWidthDefault" }

  type ColSpec = [Alignment,ColWidth]

  type QuoteType = "SingleQuote" | "DoubleQuote"
  type MathType = "DisplayMath" | "InlineMath"
  type CitationMode = "AuthorInText" | "SuppressAuthor" | "NormalCitation"

  interface Citation {
    citationId: string
    citationPrefix: Inline[]
    citationSuffix: Inline[]
    citationMode: CitationMode
    citationNoteNum: number
    citationHash: number
  }

  type Inline =
    { t: "Str", c: string } |
    { t: "Emph", c: Inline[] } |
    { t: "Underline", c: Inline[] } |
    { t: "Strong", c: Inline[] } |
    { t: "Strikeout", c: Inline[] } |
    { t: "Superscript", c: Inline[] } |
    { t: "Subscript", c: Inline[] } |
    { t: "SmallCaps", c: Inline[] } |
    { t: "Quoted", c: [QuoteType, Inline[]] } |
    { t: "Cite", c: [Citation[], Inline[]] } |
    { t: "Code", c: [Attr, string] } |
    { t: "Space" } |
    { t: "SoftBreak" } |
    { t: "LineBreak" } |
    { t: "Math", c: [MathType, string] } |
    { t: "RawInline", c: [Format, string] } |
    { t: "Link", c: [Attr, Inline[], Target] } |
    { t: "Image", c: [Attr, Inline[], Target] } |
    { t: "Note", c: Block[] } |
    { t: "Span", c: [Attr, Inline[]] }

  type Block =
    { t: "Plain", c: Inline[] } |
    { t: "Para", c: Inline[] } |
    { t: "LineBlock", c: Inline[][] } |
    { t: "CodeBlock", c: [Attr, string] } |
    { t: "RawBlock", c: [Format, string] } |
    { t: "BlockQuote", c: Block[] } |
    { t: "OrderedList", c: [ListAttributes, Block[][]] } |
    { t: "BulletList", c: Block[][] } |
    { t: "DefinitionList", c: [Inline[], Block[][]][] } |
    { t: "Header", c: [Int, Attr, Inline[]] } |
    { t: "HorizontalRule" } |
    { t: "Table", c: [Attr, Caption, ColSpec[], TableHead, TableBody[], TableFoot] } |
    { t: "Div", c: [Attr, Block[]] } |
    { t: "Null" }
}