import { Config } from "./config";
import { Construct } from 'constructs';

export interface Context {
    stage: string,
    config: Config,
    stackType: string,
    scope: Construct,
    prefix: string,
}