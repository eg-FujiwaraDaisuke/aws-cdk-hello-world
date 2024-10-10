import * as path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  // CDK アプリのエントリーポイントを指定
  // Todo　app.tsにかえる
  entry: './bin/hello-world.ts',
  output: {
    filename: 'hello-world.js',
    path: path.resolve(__dirname, 'dist'),
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
