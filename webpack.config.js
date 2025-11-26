var htmlwp = require('html-webpack-plugin');

var path = require('path');
module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    output: {
        path: __dirname + '/dist',
        filename: 'green_rice_bundle.js',
        publicPath: ''
    },
    devtool: 'eval-source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.json', '.js']
    },
    plugins: [
        //插件管理中心
        new htmlwp({
            title: '首页',
            filename: 'index.html',
            template: './index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/, //.ts,.tsx文件的正则表达式
                loader: 'ts-loader' //.ts,.tsx文件的加载器
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'] //程序会先加载css-loader，然后在加载style-loader文件
            }
        ]
    },
    devServer: {
        //webpack-dev-server
        static: [
            {
                directory: path.join(__dirname, 'dist') //编译生产的文件目录地址
            },
            {
                directory: path.join(__dirname, 'configs'), //静态文件目录
                publicPath: '/configs'
            }
        ],
        compress: true, //是否压缩
        historyApiFallback: true,
        hot: true, //是否热更
        https: false, //是否为https
        host: 'localhost',
        // overlay: true,
        port: 7001, //端口
        headers: {
            origin: '*',
            host: '*',
            referer: '*'
        }

        // open: true,     //自动打开浏览器
    }
};
