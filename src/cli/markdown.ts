import markdownit from 'markdown-it';
import container from 'markdown-it-container';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import bspans from 'markdown-it-bracketed-spans';
import attrs from 'markdown-it-attrs';
import secs from 'markdown-it-header-sections';
import Token from 'markdown-it/lib/token';
import MarkdownIt from 'markdown-it';
import nomnoml from 'nomnoml';

export default class Markdown {    
    readonly md: MarkdownIt

    constructor(processClasses?: (classes: string[]) => void) {
        this.md = markdownit().use(container, 'classes', {
            validate(params: string) {
                return params.trim().match(/^(\w+\s+)*\w+$/)
            },
            render(tokens: Token[], idx: number) {
                const classes = tokens[idx].info.trim().split(/\s+/)
                processClasses?.(classes)
                if (tokens[idx].nesting === 1) {
                    // opening tag
                    return `<div class="${classes.join(' ')}">\n`;
                } else {
                    // closing tag
                    return '</div>\n';
                }
            }
        })
            .use(texmath, { engine: katex, delimiters: 'dollars' })
            .use(bspans)
            .use(attrs)
            .use(secs)

        if (processClasses) {
            const renderAttrs = this.md.renderer.renderAttrs
            this.md.renderer.renderAttrs = function (tkn) {
                if (tkn.attrs) {
                    const c = tkn.attrs.find(x => x && x[0] == "class")
                    if (c) {
                        const classes = c[1].split(/\s+/);
                        processClasses(classes);
                    }
                }
                return renderAttrs(tkn)
            }
        } 

        this.md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            token.attrJoin('class',token.info)
            if (token.attrGet('class') == "nomnoml") {
                return nomnoml.renderSvg(token.content)
            } else {
                return '<pre' + slf.renderAttrs(token) + '>'
                    + '<code>' + token.content + '</code>'
                    + '</pre>';
            }
        }
    }

    public render(input: string): string {
        return this.md.render(input)
    }
}