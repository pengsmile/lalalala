//webpack.config.dll.js
const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const { library } = require("./dll.config");

module.exports = {
    entry: {
        ...library
    },
    mode: 'production',
    output: {
        filename: '[name].dll.js',
        path: path.resolve(__dirname, 'dist', 'dll'),
        library: '[name]_dll' //暴露给外部使用
        //libraryTarget 指定如何暴露内容，缺省时就是 var
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DllPlugin({
            //name和library一致
            name: '[name]_dll', 
            path: path.resolve(__dirname, 'dist', 'dll', '[name]-manifest.json') //manifest.json的生成路径
        })
    ]
}