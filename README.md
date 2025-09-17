## JSA Mobile Proxy

将棋連盟ライブ中継アプリからバイナリ化された棋譜データを取得して復号しJKF形式で返すAPIです.

[定期実行](http://localhost:28787/__scheduled?cron=*+*+*+*+*)

### 利用技術スタック

- Bun
- Cloudflare Workers
- Commitlint
- GitHub Actions
- Hono
- Husky
- Zod

### Cron Trigger

- [http://localhost:18787/__scheduled?cron=*/5+*+*+*+*](http://localhost:18787/__scheduled?cron=*/5+*+*+*+*)
- [http://localhost:18787/__scheduled?cron=0+*+*+*+*](http://localhost:18787/__scheduled?cron=0+*+*+*+*)
- [http://localhost:18787/__scheduled?cron=0+21+*+*+*](http://localhost:18787/__scheduled?cron=0+21+*+*+*)

### 対応フォーマット

- [x] JKF

## 対応棋戦

以下の棋戦のうち, [将棋連盟ライブ中継アプリ](https://www.shogi.or.jp/lp/mr201704/)で観戦できる対局データを取得できます.

> 対局データの取得には将棋連盟ライブ中継アプリの有料会員の契約が必要です

### データソース

- Cloudfront
  - [対局情報一覧](https://d2pngvm764jm.cloudfront.net/ai/ai_game_list.txt)
  - [対局情報詳細](https://d2pngvm764jm.cloudfront.net/ai/17361.json)
- 日本将棋連盟ライブ中継アプリ
  - [対局情報一覧](https://ip.jsamobile.jp/api/index.php?action=search&p3=3&p1=0&p2=1400)
  - [対局情報詳細](https://ip.jsamobile.jp/api/index.php?action=shogi&p1=17361)
- 名人戦棋譜速報
  - [対局情報詳細(サンプル)](https://www.meijinsen.jp/sample_kj/10752.txt?gyoku=3?1725419475165)

#### 棋譜数

| プラットフォーム             | 棋譜数     | 形式     |
| :--------------------------: | :--------: | :------: |
| Cloudfront                   | 5347       | JSON     |
| 日本将棋連盟ライブ中継アプリ | 867(19137) | バイナリ |
| 名人戦棋譜速報               | 不明       | 不明     |

#### IDについて

|                    | ID    | 対局ID | 記録ID                   |
| :----------------: | :---: | :----: | :----------------------: |
| 羽生善治 vs 渡辺明 | 10752 | 9698   | 5d89cb0a8554e2000497df63 |
| 泉正樹 vs 西山朋佳 | -     | 10752  | -                        |

> 上記URLには認証が必要
>
> IDは名人戦棋譜速報IDで対局IDとは異なる
>
> 記録IDはリコー自動棋譜記録システムを使用した際の管理ID

### 一般棋戦

- [x] 名人戦
- [x] 竜王戦
- [x] 王位戦
- [x] 叡王戦
- [x] 王座戦
- [x] 棋王戦
- [x] 王将戦
- [x] 棋聖戦
- [x] 順位戦
- [x] 朝日杯将棋オープン戦
- [x] 日本シリーズJT杯
- [x] 達人戦
- [x] 新人王戦
- [x] 加古川青流戦
- [ ] NHK杯トーナメント

### 女流棋戦

- [x] 白玲戦
- [x] 清麗戦
- [x] マイナビ女子オープン
- [x] 女流王座戦
- [x] 女流名人戦
- [x] 女流王位戦
- [x] 女流王将戦
- [x] 倉敷藤花戦
- [x] 女流順位戦
- [x] 白瀧あゆみ杯

## Special Thanks

- [soltia48](https://github.com/soltia48) 棋譜データのバイナリ解析
