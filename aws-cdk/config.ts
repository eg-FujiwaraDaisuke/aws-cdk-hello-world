import * as path from "path";

export class Config {
  public readonly rootDir = path.join(__dirname, "../");
  public readonly distDir = path.join(this.rootDir, ".dist");
  public readonly userPoolId: string;

  constructor(userPoolId: string) {
    this.userPoolId = userPoolId;
  }

  /**
   * 環境別に許可されたオリジンを返す
   * @param { string } stage - 環境（例: 'dev', 'stg', 'prd'）
   * @return { string[] } - 許可されたオリジンの配列
   */
  // public allowOrigins(stage: string): string[] {
  //     const localhost = 'http://localhost:3000';
  //     switch (stage) {
  //         case 'dev':
  //             return ['https:'];
  //         case 'stg':
  //             return ['https:', localhost];
  //         case 'prd':
  //             return ['https:'];
  //         default:
  //             return [];
  //     }
  // }
}
