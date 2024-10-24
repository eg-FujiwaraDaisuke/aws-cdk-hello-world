import * as path from 'path';

export class Config {
    public readonly rootDir = path.join(__dirname, '../../');
    public readonly distDir = path.join(this.rootDir, '.dist');

    /**
     * 環境別にuserPoolを返す
     * @param { string } stage - 環境（例: 'dev', 'stg', 'prd'）
     * @return { string } - userPool文字列
     */
    public userPool(stage: string): string {
        switch (stage) {
            case 'dev':
                return 'ap-northeast-dev';
            case 'stg':
                return 'ap-northeast-stg';
            case 'prd':
                return 'ap-northeast-prd';
            default:
                return '';
        }
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