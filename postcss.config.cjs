module.exports = {
    plugins: [
        require('postcss-import')(),
        {
            postcssPlugin: "woff-only",
            AtRule: {
                "font-face": rule => {
                    rule.each(decl => {
                        if (decl.prop == 'src') {
                            v = RegExp(/url\(['"]?([^)"']+\.woff)['"]?\)/g).exec(decl.value)
                            if (v !== null) {
                                decl.value = `url(${v[1]}) format('woff')`
                            } else {
                                decl.remove()
                            }
                        }
                    })                    
                }
            }
        },
        require('postcss-url')({
            filter: "**/*.!(woff2|eot|ttf|otf)",
            url: "copy"            
        }),
        require('cssnano')({            
        })
    ]
}