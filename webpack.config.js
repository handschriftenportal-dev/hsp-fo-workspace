const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/HspWorkspace.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hsp-fo-workspace.js',
    chunkFilename: 'hsp-fo-workspace.[contenthash].js',
  },
  devServer: {
      port: 8080,
      static:  [
        { 
         directory: path.join(__dirname, 'src'),
        },
        {       
          directory: path.join("node_modules/hsp-fo-mirador/dist", '/fonts'),
          publicPath: '/fonts/'
        },
        {       
          directory: path.join("node_modules/hsp-fo-mirador/dist", '/img'),
          publicPath: '/img/'
        },
        {       
          directory: path.join(__dirname, 'fixtures')
        },
      ],
   },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
        }
      },
      {
        test: /\.(css)$/,
        use: ['style-loader', 'css-loader']
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin()
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/hsp-web-module/fonts'),
          to: path.resolve(__dirname, 'dist/fonts'),
        },
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/hsp-fo-mirador/dist'),
          to: path.resolve(__dirname, 'dist')
        },
        {
          from: path.resolve(__dirname, 'node_modules/hsp-fo-mirador/dist'),
          to: path.resolve(__dirname, 'dist')
        },
      ]
    }),
  ],
  devtool: 'source-map',
}