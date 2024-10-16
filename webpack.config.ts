'use strict';
import * as path from 'path';
import { Configuration } from 'webpack';
import * as fs from 'fs';
// const nodeExternals = require('webpack-node-externals');
// const CopyPlugin = require('copy-webpack-plugin');

const ROOT_DIR = path.resolve(__dirname);
// const SRC_DIR = path.join(ROOT_DIR, 'src');

const entry = { ...getEntries('lambda') };

const config: Configuration = {
  // CDK アプリのエントリーポイントを指定
  // Todo　app.tsにかえる
  entry: './bin/hello-world.ts',
  output: {
    filename: '[name].js',
    path: path.resolve(ROOT_DIR, '.dist'),
    // CDK アプリは CommonJS モジュールとしてエクスポートされるため
    libraryTarget: 'commonjs2',
  },
  // Node.js 環境をターゲット
  target: 'node',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  // 警告を抑制する設定を追加
  ignoreWarnings: [
    {
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
};

export default config;

function getEntries(dirname, entries = {}) {
  const dirpath = path.join(ROOT_DIR, dirname);
  const dirs = fs.readdirSync(dirpath, { withFileTypes: true });
  const targets = dirs.filter(({ name }) => name !== 'base');

  for (const dirent of targets) {
      const { name } = dirent;

      if (dirent.isDirectory()) {
          Object.assign(entries, getEntries(path.join(dirname, name), entries));
      }
      if (dirent.isFile()) {
          const nameWithoutExtension = name.split('.')[0];
          entries[`${dirname}/${nameWithoutExtension}/index`] = path.join(dirpath, name);
      }
  }

  return entries;
}