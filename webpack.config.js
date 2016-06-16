module.exports = {
    entry: {
        'inject': './src/inject.js',
        'app': './src/app.js'
    },
    output: {
        filename: './dist/[name].js'
    },
    module: {
        loaders: [{
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=es2015&presets[]=react'
            }, {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }, {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader'
            }, {
                test: /\.(png|jpg|woff|svg)$/,
                loader: 'url-loader?limit=8192'
            }

        ]
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        //  "jquery": "jQuery"
        'data': 'data'
    }
};
