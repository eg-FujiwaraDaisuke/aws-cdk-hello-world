#!/bin/bash

# スクリプトの実行時にエラーが発生したら終了
set -e

# 必要なパッケージのインストール
echo "Installing Node.js and AWS CDK..."
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs
sudo npm install -g aws-cdk

# アプリケーションコードをコピーする
echo "Copying application code..."
# 変数の定義（ローカルのパスと EC2 インスタンス内のパスを設定）
LOCAL_APP_PATH="/path/to/your/cdk-app"  # ローカルのアプリケーションパス
EC2_APP_PATH="/home/ec2-user/cdk-app"    # EC2 インスタンス内のアプリケーションパス

# scp を使用してアプリケーションコードをコピー
scp -i /path/to/your/key.pem -r $LOCAL_APP_PATH ec2-user@<your-instance-ip>:$EC2_APP_PATH

# EC2 インスタンス内でのビルドとデプロイ
echo "Building and deploying the application..."
ssh -i /path/to/your/key.pem ec2-user@<your-instance-ip> << EOF
cd $EC2_APP_PATH
npm install
cdk deploy
EOF

echo "Deployment completed."