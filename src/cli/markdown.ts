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
import highlightStyle from '../shared/codemirror/highlight';
import { highlightTree, styleTags } from '@codemirror/highlight';
import { Language } from '@codemirror/language';
import languages from '../shared/codemirror/languages';

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
            return `<figure>${slf.renderToken(tokens,idx,opts)}<figcaption>${slf.renderInline(token?.children || [],opts,env)}</figcaption></figure>`
        }

        this.md.renderer.rules.fence = function (tokens, idx, options, env: { highlighters: { [key: string]: Language } }, slf) {
            const token = tokens[idx];
            let str = token.content
            if (str.slice(-1) == '\n') str = str.slice(0,-1)
            const m = token.info.match(/\S+/)
            token.attrJoin('class',token.info)
            let res = '<div class="line">'                
            const newline = "</div><div class='line'>"                
            if (m && m[0] && env.highlighters[m[0]]) {
                const lang = env.highlighters[m[0]]
                let i = 0                
                highlightTree(lang.parseString(str),highlightStyle.match,
                    (from,to,classes) => {
                        if (i < from)
                            res += str.slice(i,from).replaceAll('\n',newline)
                        res += `<span class="${classes}">`
                        res += str.slice(from,to).replaceAll('\n',`</span>${newline}<span class=${classes}>`)
                        res += '</span>'
                        i = to
                    }
                )
                res += str.slice(i).replaceAll('\n',newline)                
            } else {
                res += str.replaceAll('\n',newline)
            }   
            
            res += '</div>'            
        
            return '<pre' + slf.renderAttrs(token) + '>'
                + '<code>' + res + '</code>'
                + '</pre>';
        }
    }

    public async render(input: string): Promise<string> {
        const env: { highlighters: { [key: string]: Language } } = {
            highlighters: {}
        }
        const parse = this.md.parse(input,env)        
        const extractLanguages = async (tkn: Token) => {
            if (tkn.type == 'fence') {
                const m = tkn.info.match(/\S+/)
                if (m && m[0]) {
                    if (languages[m[0]])
                      env.highlighters[m[0]] = await languages[m[0]]()
                }
                return
            } else {             
                if (tkn.children) {
                    await Promise.all(tkn.children.map(extractLanguages))
                }                
                return
            }
        }        
        await Promise.all(parse.map(extractLanguages))
        const res = this.md.renderer.render(parse,this.md.options,env)
        return res
    }
}