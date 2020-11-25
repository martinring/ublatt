module.exports = {
    plugins: [
        require('postcss-import')(),        
        {
            postcssPlugin: "woff2-only",
            AtRule: {
                "font-face": rule => {
                    rule.each(decl => {
                        if (decl.prop == 'src') {                            
                            v = RegExp("[^,]*woff2[^,]*","g").exec(decl.value)
                            if (v !== null) {
                                decl.value = v[0]
                            }
                        }
                    })                    
                }
            }
        },
        require('postcss-url')({
            url: "copy",            
            assetsPath: "assets",
            useHash: true            
        }),
        require('cssnano')({
            preset: 'default',
        })
    ]
}