const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

const miradorDistFolder = path.resolve(__dirname, 'node_modules/hsp-fo-mirador/dist')
const miradorChunks = fs.readdirSync(miradorDistFolder)
  .filter(fname => fname.endsWith('hsp-fo-mirador.js'))
  .map(fname => path.join(miradorDistFolder, fname))

module.exports = {
  ...webpackConfig,
  entry: [
    './src/HspWorkspace.ts',
    ...miradorChunks,
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hsp-fo-workspace.standalone.js'
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ]
}
