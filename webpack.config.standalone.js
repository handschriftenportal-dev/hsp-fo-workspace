const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

const miradorDistFolder = path.resolve(
  __dirname,
  'node_modules/hsp-fo-mirador/dist',
)
const miradorChunks = fs
  .readdirSync(miradorDistFolder)
  .filter(
    (fname) =>
      (fname.startsWith('hsp-fo-mirador.') && fname.endsWith('.js')) || // new: from hsp-fo-mirador.[contenthash].js
      fname.endsWith('hsp-fo-mirador.js'), // legacy: from [id].hsp-fo-mirador.js files
  )
  .map((fname) => path.join(miradorDistFolder, fname))

module.exports = {
  ...webpackConfig,
  entry: ['./src/HspWorkspace.ts', ...miradorChunks],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hsp-fo-workspace.standalone.js',
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
}
