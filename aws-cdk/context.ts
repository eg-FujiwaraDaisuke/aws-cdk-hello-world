import { Construct } from "constructs";
import { Config } from "./config";

/**
 * Context インターフェース
 * 
 * @param stage 環境（dev/stg/prd）
 * @param config rootDir/distDir/userPoolIdを持つ
 * @param stackType stf03111-${stackName}
 * @param scope スコープ
 * @param prefix ${stackType}-${stage}
 */
export interface Context {
  stage: string;
  config: Config;
  stackType: string;
  scope: Construct;
  prefix: string;
}
