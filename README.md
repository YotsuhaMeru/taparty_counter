# TAParty QR Counter

Next.js、Prisma、WebAuthn (Passkey) を使用したカウンターアプリケーション。

## 前提条件

- Node.js (v20以上推奨)
- PostgreSQL データベース

## セットアップ手順

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd sammyqr-counter
npm install
```

### 2. 環境変数の設定

ルートディレクトリに `.env` ファイルを作成し、環境に合わせて以下の変数を設定してください。

```env
# アプリケーションのドメイン設定 (ローカル開発の場合)
NEXT_PUBLIC_RP_ID=localhost
NEXT_PUBLIC_ORIGIN=http://localhost:3000

# JWT署名用のシークレットキー (ランダムな文字列を設定してください)
JWT_SECRET=complex_random_secret_string_here

# データベース接続URL
# フォーマット: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/sammyqrdb?schema=public"

# ユーザー登録時の招待コード
INVITATION_CODE="gommy2026"
```

**注意点:**

- `NEXT_PUBLIC_RP_ID`: WebAuthn (Passkey) のRelying Party IDとして使用されます。ローカル開発時は `localhost` を設定します。
- `NEXT_PUBLIC_ORIGIN`: アプリケーションのオリジンURLです。

### 3. データベースのセットアップ

Prismaを使用してデータベーススキーマを適用します。

```bash
# マイグレーションの実行
npx prisma migrate dev --name init

# クライアントの生成
npx prisma generate
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして動作を確認してください。

## 利用可能なコマンド

| コマンド            | 説明                                          |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | 開発サーバーを起動します (ホットリロード有効) |
| `npm run build`     | 本番環境用にアプリケーションをビルドします    |
| `npm run start`     | ビルドされたアプリケーションを起動します      |
| `npm run lint`      | ESLintを実行してコードの静的解析を行います    |
| `npx prisma studio` | ブラウザベースのGUIでデータベースを管理します |

## 技術スタック

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: WebAuthn (Passkey) via [@simplewebauthn](https://simplewebauthn.dev/), JWT

## ディレクトリ構成

- `app/`: Next.js App Routerのページとコンポーネント
- `lib/`: ユーティリティ関数、認証ロジック、DBクライアント
- `prisma/`: Prismaスキーマ、マイグレーションファイル、シードスクリプト
- `public/`: 静的ファイル
