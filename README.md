# Neo4j_trial

このプロジェクトは、Neo4jグラフデータベースを使用した人物検索システムです。

## セットアップ手順

### 1. Neo4jのインストール

#### Windowsの場合
1. [Neo4j Desktop](https://neo4j.com/download/)をダウンロードしてインストール
2. 新しいプロジェクトを作成
3. データベースを作成し、パスワードを設定（例：`secret_password`）

#### macOSの場合
```bash
# Homebrewを使用
brew install neo4j

# または公式インストーラーを使用
# https://neo4j.com/download/
```

#### Linuxの場合
```bash
# Ubuntu/Debian
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
sudo apt-get install neo4j

# または公式インストーラーを使用
```

### 2. Neo4jの設定

1. Neo4jを起動
2. ブラウザで http://localhost:7474 にアクセス
3. 初期パスワード（通常は`neo4j`）でログイン
4. 新しいパスワードを設定（例：`secret_password`）

### 3. 環境変数の設定

プロジェクトのルートディレクトリに`.env`ファイルを作成：

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=secret_password
```

### 4. バックエンドのセットアップ

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 5. フロントエンドのセットアップ

```bash
cd frontend
npm install
npm start
```

## 使用方法

1. Neo4jが起動していることを確認
2. バックエンドサーバーを起動（ポート8000）
3. フロントエンドサーバーを起動（ポート3000）
4. ブラウザで http://localhost:3000 にアクセス

## 注意事項

- Neo4jが起動していない場合、アプリケーションは正常に動作しません
- パスワードは必ず環境変数で設定してください
- 初回起動時は、Neo4jにデータをインポートする必要があります