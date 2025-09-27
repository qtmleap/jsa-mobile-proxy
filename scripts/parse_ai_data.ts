interface AIGameData {
  game_id: number;
}

export function parseAIGameList(content: string): AIGameData[] {
  const games: AIGameData[] = [];

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // ヘッダー行（#で始まる）や空行をスキップ
    if (trimmedLine.startsWith('#') || !trimmedLine) {
      continue;
    }

    // 数値のみの行を処理
    const gameId = parseInt(trimmedLine);
    if (!isNaN(gameId)) {
      games.push({ game_id: gameId });
    }
  }

  return games;
}

// ファイルから読み込む関数
export async function parseAIGameListFromFile(filePath: string): Promise<AIGameData[]> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return parseAIGameList(content);
}

// 実行例（直接実行する場合）
if (import.meta.main) {
  const filePath = '/home/vscode/app/__tests__/ai/ai_game_list.txt';

  parseAIGameListFromFile(filePath)
    .then((games) => {
      console.log(`パースしたAIゲーム数: ${games.length}`);

      console.log('最初の5件:');
      games.slice(0, 5).forEach((game, index) => {
        console.log(`${index + 1}: ${JSON.stringify(game)}`);
      });

      console.log('\n最後の5件:');
      games.slice(-5).forEach((game, index) => {
        console.log(`${games.length - 4 + index}: ${JSON.stringify(game)}`);
      });

      // JSONファイルとして出力
      const fs = require('fs/promises');
      fs.writeFile(
        '/home/vscode/app/output/ai_games.json',
        JSON.stringify(games, null, 2)
      ).then(() => {
        console.log('\nJSONファイルを出力しました: /home/vscode/app/output/ai_games.json');
      });
    })
    .catch(console.error);
}
