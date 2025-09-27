interface MeijinGameData {
  game_id: number;
  meijin_id: number;
  tablet_id: string;
  kif_key: string;
  modified: number;
  modified_date?: string;
  start_date: string;
  end_date: string;
  kisen: string;
  side: number;
  sente: string;
  gote: string;
  family1: string;
  name1: string;
  title1: string;
  family2: string;
  name2: string;
  title2: string;
  senkei: string;
  result: number;
  winner: number;
  tesuu: number;
  sente_score?: string;
  gote_score?: string;
}

export function parseMeijinData(content: string): MeijinGameData[] {
  const games: MeijinGameData[] = [];

  // ヘッダー部分を除去して、ゲームデータ部分のみを取得
  const lines = content.split('\n');
  let gameStartIndex = -1;

  // 最初のゲーム（/-----）を見つける
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('/-----')) {
      gameStartIndex = i;
      break;
    }
  }

  if (gameStartIndex === -1) {
    throw new Error('ゲームデータが見つかりません');
  }

  // ゲームデータ部分を分割
  const gameDataLines = lines.slice(gameStartIndex);
  const gameBlocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of gameDataLines) {
    if (line.startsWith('/-----')) {
      if (currentBlock.length > 0) {
        gameBlocks.push(currentBlock);
      }
      currentBlock = [];
    } else if (line.trim()) {
      currentBlock.push(line);
    }
  }

  // 最後のブロックを追加
  if (currentBlock.length > 0) {
    gameBlocks.push(currentBlock);
  }

  // 各ゲームブロックをパース
  for (const block of gameBlocks) {
    const gameData: Partial<MeijinGameData> = {};

    for (const line of block) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('='); // =が値に含まれる場合に対応

        switch (key.trim()) {
          case 'game_id':
            gameData.game_id = parseInt(value);
            break;
          case 'meijin_id':
            gameData.meijin_id = parseInt(value);
            break;
          case 'tablet_id':
            gameData.tablet_id = value;
            break;
          case 'kif_key':
            gameData.kif_key = value;
            break;
          case 'modified':
            // コメント部分を除去してタイムスタンプを取得
            const modifiedMatch = value.match(/^(\d+)/);
            if (modifiedMatch) {
              gameData.modified = parseInt(modifiedMatch[1]);
              // コメント部分（日付）も保存
              const dateMatch = value.match(/\/\/ (.+)/);
              if (dateMatch) {
                gameData.modified_date = dateMatch[1].trim();
              }
            }
            break;
          case 'start_date':
            gameData.start_date = value;
            break;
          case 'end_date':
            gameData.end_date = value;
            break;
          case 'kisen':
            gameData.kisen = value;
            break;
          case 'side':
            gameData.side = parseInt(value);
            break;
          case 'sente':
            gameData.sente = value;
            break;
          case 'gote':
            gameData.gote = value;
            break;
          case 'family1':
            gameData.family1 = value;
            break;
          case 'name1':
            gameData.name1 = value;
            break;
          case 'title1':
            gameData.title1 = value;
            break;
          case 'family2':
            gameData.family2 = value;
            break;
          case 'name2':
            gameData.name2 = value;
            break;
          case 'title2':
            gameData.title2 = value;
            break;
          case 'senkei':
            gameData.senkei = value;
            break;
          case 'result':
            gameData.result = parseInt(value);
            break;
          case 'winner':
            gameData.winner = parseInt(value);
            break;
          case 'tesuu':
            gameData.tesuu = parseInt(value);
            break;
          case 'sente_score':
            gameData.sente_score = value;
            break;
          case 'gote_score':
            gameData.gote_score = value;
            break;
        }
      }
    }

    // 必須フィールドがあることを確認してから追加
    if (gameData.game_id && gameData.meijin_id && gameData.kif_key) {
      games.push(gameData as MeijinGameData);
    }
  }

  return games;
}

// 使用例とテスト用の関数
export async function parseMeijinDataFromFile(filePath: string): Promise<MeijinGameData[]> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return parseMeijinData(content);
}

// 実行例（直接実行する場合）
if (import.meta.main) {
  const filePath = '/home/vscode/app/__tests__/meijin/meijin_all_game_list.txt';

  parseMeijinDataFromFile(filePath)
    .then((games) => {
      console.log(`パースしたゲーム数: ${games.length}`);

      // game_id、meijin_id、kif_keyのみを抽出
      const simplifiedGames = games.map(game => ({
        game_id: game.game_id,
        meijin_id: game.meijin_id,
        kif_key: game.kif_key
      }));

      console.log('最初のゲーム:');
      console.log(JSON.stringify(simplifiedGames[0], null, 2));

      console.log('\n最後のゲーム:');
      console.log(JSON.stringify(simplifiedGames[simplifiedGames.length - 1], null, 2));

      // JSONファイルとして出力
      const fs = require('fs/promises');
      fs.writeFile(
        '/home/vscode/app/output/meijin_games_simple.json',
        JSON.stringify(simplifiedGames, null, 2)
      ).then(() => {
        console.log('\nJSONファイルを出力しました: /home/vscode/app/output/meijin_games_simple.json');
      });
    })
    .catch(console.error);
}
