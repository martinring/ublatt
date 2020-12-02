module.exports = {
    plugins: [
        require('postcss-import')(),        
        require('postcss-url')({
            url: "copy",            
            assetsPath: "assets",
            useHash: true
        })
    ]
}