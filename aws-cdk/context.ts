import { Construct } from "constructs";
import { Config } from "./config";

/**
 * コンテキスト情報を提供するインターフェース
 * stage: string  環境(prd・stg・devなど)
 * config: Config(rootPath・distPath・userPollIdを持つ)
 * stackType: string  stf03111-${スタック名}
 * scope: scope
 * prefix: string  ${stackType}-${stage}
 */
export interface Context {
  stage: string;
  config: Config;
  stackType: string;
  scope: Construct;
  prefix: string;
}
