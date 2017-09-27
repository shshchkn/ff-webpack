const path = require('path');
const webpack = require('webpack');
const HTML = require('html-webpack-plugin');
const merge = require('webpack-merge');
const pug = require('./webpack-bandles/pug');
const devserver = require('./webpack-bandles/devserver');
const sass = require('./webpack-bandles/sass');
const css = require('./webpack-bandles/css');
const extractCSS = require('./webpack-bandles/css.extract');
const uglifyJS = require('./webpack-bandles/js.uglify');
const images = require('./webpack-bandles/images');
const fonts = require('./webpack-bandles/fonts');

const PATHS = {
    src: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'public')
};

const common = merge(
    {
        entry: {
            'index': PATHS.src + '/pages/index/index.js'
        },
        output: {
          path: PATHS.build,
          filename: 'js/[name].js'
        },
        devtool: 'source-map',
        plugins: [
            new HTML({
                filename: 'index.html',
                chunks: ['index', 'common'],
                template: PATHS.src + '/pages/index/index.pug'
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common'
            })
        ]
    },
    fonts(),
    pug(),
    images()
);

module.exports = (env) => {
    if (env === 'production') {
        return merge(
            [
                common,
                extractCSS(),
                uglifyJS()
            ]
        );
    }
    if (env === 'development') {
        return merge(
            [
                common,
                devserver(),
                sass(),
                css()
            ]
        );
    }
};