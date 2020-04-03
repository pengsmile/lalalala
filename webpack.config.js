const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const pxtorem = require('postcss-pxtorem');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin"); // 量化包
const Visualizer = require('webpack-visualizer-plugin'); // remove it in production environment.
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // remove it in production environment.
const otherPlugins = process.argv[1].indexOf('webpack-dev-server') >= 0 ? [] : [
  new Visualizer(), // remove it in production environment.
  new BundleAnalyzerPlugin({ // 查看各个包大小
    defaultSizes: 'parsed',
    // generateStatsFile: true,
    statsOptions: { source: false }
  }), // remove it in production environment.
];
const smp = new SpeedMeasurePlugin(); // 看打包编译时间
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); // 开启缓存
const Happypack = require('happypack'); // 多线程

const { library } = require("./dll.config.js"); // 公共库

const postcssOpts = {
  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
  plugins: [
    // autoprefixer({
    //   browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
    // }),
    // pxtorem({ rootValue: 100, propWhiteList: [] })
    autoprefixer
  ],
};

module.exports = smp.wrap({
  devtool: 'cheap-module-source-map', // or 'inline-source-map'
  watch: true,
  watchOptions: {
      ignored: /node_modules/,
      // aggregateTimeout: 300
  },
  entry: { "index": path.resolve(__dirname, 'src/index') },

  output: {
    // chunkFilename: '[id].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    filename: 'Template/marketingSales/DentistryCollectFees/[name].js'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), path.join(__dirname, 'src')],
    extensions: ['.web.js', '.jsx', '.js', '.json'],
    alias: {
        '@': path.resolve(__dirname, './src'),
    }
  },
  module: {
    rules: [
      // {
      //   test: /\.js[x]?$/,
      //   use: 'Happypack/loader?id=js',
      //   include: [path.resolve(__dirname, 'src')]
      // },
      {
        test: /\.js[x]?$/, 
        // use: ['cache-loader','babel-loader'],
        exclude: /node_modules/,
        use: ['babel-loader?cacheDirectory'],
        // loader: "babel-loader?cacheDirectory",
        include: [path.resolve(__dirname, 'src')]
      },
      { test: /\.(jpg|png)$/, loader: "url-loader?limit=8192" },
      // 注意：如下不使用 ExtractTextPlugin 的写法，不能单独 build 出 css 文件
      // { test: /\.less$/i, loaders: ['style-loader', 'css-loader', 'less-loader'] },
      // { test: /\.css$/i, loaders: ['style-loader', 'css-loader'] },
      {
        test: /\.less$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', { loader: 'postcss-loader', options: postcssOpts }, 'less-loader'
          ]
        })
      },
      {
        test: /\.css$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', { loader: 'postcss-loader', options: postcssOpts }
          ]
        })
      }
    ]
  },
//   externals: {
//     "react": "React",
//     "react-dom": "ReactDOM"
//   },
  plugins: [
    // new HardSourceWebpackPlugin({
    //   cacheDirectory: 'node_modules/.cache/hard-source/[confighash]',
    //   recordsPath: 'node_modules/.cache/hard-source/[confighash]/records.json',
    //   environmentHash: {
    //     root: process.cwd(),
    //     directories: [],
    //     files: ['package-lock.json'],
    //   }
    // }),
    new Happypack({
      id: 'js', //和rule中的id=js对应
      //将之前 rule 中的 loader 在此配置
      use: ['babel-loader'] //必须是数组
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new webpack.optimize.CommonsChunkPlugin('shared.js'),
    // new BundleAnalyzerPlugin(),
    new ExtractTextPlugin({ filename: 'Template/marketingSales/DentistryCollectFees/[name].css', allChunks: true }),
    ...otherPlugins,
    /**
     *  ------------------ START ----------
     * 抽离公共库
     * 详细抽离库请看 dll.config.js
     */
    // new webpack.DllReferencePlugin({
    //   manifest: path.resolve(__dirname, 'dist', 'dll', 'manifest.json')
    // }),
    ...Object.keys(library).map(name => {
      return new webpack.DllReferencePlugin({
        context: ".",
        manifest: path.join(__dirname, 'dist', 'dll', `${name}-manifest.json`)
      });
    }),
    // -------------------- END -----------
    new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] //不删除dll目录
    }),
    new HtmlWebpackPlugin({
        chunks: ['index'],
        filename: path.join(__dirname, './dist/DentistryCollectFees/DentistryColl/DentistryCollectFees.html'), // 文件写入路径
        template: path.join(__dirname, './src/index.html'), // 模板文件路径
        inject: 'head',
        hash: false,
        // excludeChunks: [], // 排除模块
        minify: {
            //删除注释
            removeComments: true,
            //删除空格
            collapseWhitespace: false
        }
    })
  ],
  // optimization: {
  //   splitChunks: {
  //       cacheGroups: {
  //           commons: {
  //               name: 'shared',
  //               filename: 'shared.js'
  //               // minChunks: 2,
  //           }
  //       }
  //   }
  // },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    openPage: 'DentistryCollectFees/DentistryColl/DentistryCollectFees.html',
    compress: true,
    port: 9001,
    open: true,
    // 在页面上全屏输出报错信息
    overlay: {
        warnings: true,
        errors: true
    },
    inline: true, // 开启自动刷新
}
})


// "babel": {
  //   "presets": [
  //     "@babel/preset-env",
  //     "@babel/preset-react"
  //   ],
  //   "plugins": [
  //     "@babel/plugin-proposal-class-properties"
  //   ]
  // },