declare module 'markdown-it-texmath' {
    import { PluginWithOptions } from "markdown-it";
    const texmath: PluginWithOptions
    export default texmath
}

declare module 'markdown-it-bracketed-spans' {    
    import { PluginSimple } from "markdown-it";
    const bracketed_spans_plugin: PluginSimple
    export default bracketed_spans_plugin
}

declare module 'markdown-it-attrs' {
    import { PluginWithOptions } from "markdown-it";
    const attributes: PluginWithOptions
    export default attributes
}

declare module 'markdown-it-header-sections' {
    import { PluginSimple } from "markdown-it";
    const headerSections: PluginSimple
    export default headerSections
}