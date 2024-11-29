import { Construct } from "constructs";
import { Config } from "./config";

/**
 * コンテキスト情報を提供するインターフェース
 * @param stage string:  環境(prd・stg・devなど)
 * @param config Config calss: (rootPath・distPath・userPollIdを持つ)
 * @param stackType string:  stf03111-${スタック名}
 * @param scope scope
 * @param prefix string:  ${stackType}-${stage}
 */
export interface Context {
  stage: string;
  config: Config;
  stackType: string;
  scope: Construct;
  prefix: string;
}
