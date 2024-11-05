"use strict";
import * as fs from "fs";
import * as path from "path";
import { Configuration } from "webpack";

const ROOT_DIR = path.resolve(__dirname);
const SRC_DIR = path.join(ROOT_DIR, "src");
const entry = { ...getEntries("lambda-handler") };

const config: Configuration = {
  entry,
  output: {
    filename: "[name].js",
    path: path.resolve(ROOT_DIR, ".dist"),
    libraryTarget: "commonjs2",
  },
  target: "node",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  ignoreWarnings: [
    {
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
};

export default config;

function getEntries(dirname: string, entries: Record<string, string> = {}): Record<string, string> {
  const dirpath = path.join(SRC_DIR, dirname);
  const dirs = fs.readdirSync(dirpath, { withFileTypes: true });
  const targets = dirs.filter(({ name }) => name !== "base");

  for (const dirent of targets) {
    const { name } = dirent;

    if (dirent.isDirectory()) {
      Object.assign(entries, getEntries(path.join(dirname, name), entries));
    }
    if (dirent.isFile()) {
      const nameWithoutExtension = name.split(".")[0];
      entries[`${dirname}/${nameWithoutExtension}/index`] = path.join(
        dirpath,
        name,
      );
    }
  }

  return entries;
}
