import { Construct } from "constructs";
import { Config } from "./config";

export interface Context {
  stage: string;
  config: Config;
  stackType: string;
  scope: Construct;
  prefix: string;
}
