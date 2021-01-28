import markdownit from 'markdown-it';
import container from 'markdown-it-container';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import bspans from 'markdown-it-bracketed-spans';
import attrs from 'markdown-it-attrs';
import secs from 'markdown-it-header-sections';
import Token from 'markdown-it/lib/token';
import MarkdownIt from 'markdown-it';
import * as fs from 'fs';
import * as path from 'path';

interface MarkdownOptions {
    dir: string,
    processClasses?: (classes: string[]) => void,
    standalone?: boolean
}

export default class Markdown {    
    readonly md: MarkdownIt

    constructor(options: MarkdownOptions) {
        this.md = markdownit().use(container, 'classes', {
            validate(params: string) {
                return params.trim().match(/^(\w+\s+)*\w+$/)
            },
            render(tokens: Token[], idx: number) {
                const classes = tokens[idx].info.trim().split(/\s+/)
                options.processClasses?.(classes)
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

        if (options.processClasses) {
            const processClasses = options.processClasses
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

        this.md.renderer.rules.image = function (tokens, idx, opts, env, slf) {
            const token = tokens[idx];
            let src = token.attrGet('src')            
            if (src && fs.existsSync(options.dir + '/' + src)) {
                const mime = 'image/' + path.parse(src).ext.slice(1)
                const uri = `data:${mime};base64,${fs.readFileSync(options.dir + '/' + src).toString('base64')}`
                token.attrSet('src', uri)
            } else {
                console.warn(src + " does not exist")
            }
            return slf.renderToken(tokens,idx,opts)
        }

        this.md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            token.attrJoin('class',token.info)            
            return '<pre' + slf.renderAttrs(token) + '>'
                + '<code>' + token.content + '</code>'
                + '</pre>';            
        }
    }

    public render(input: string): string {
        return this.md.render(input)
    }
}