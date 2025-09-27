import fs from 'fs';
import path from 'path';

interface AIGame {
  game_id: number;
}

interface MeijinGame {
  game_id: number;
  meijin_id: number;
  kif_key: string;
}

async function compareGameLists() {
  try {
    // ファイルを読み込み
    const aiGamesPath = path.join(__dirname, '../__tests__/games/ai_game_list.json');
    const meijinGamesPath = path.join(__dirname, '../__tests__/games/meijin_all_game_list.json');

    const aiGamesRaw = fs.readFileSync(aiGamesPath, 'utf-8');
    const meijinGamesRaw = fs.readFileSync(meijinGamesPath, 'utf-8');

    const aiGames: AIGame[] = JSON.parse(aiGamesRaw);
    const meijinGames: MeijinGame[] = JSON.parse(meijinGamesRaw);

    console.log('📊 ファイル読み込み完了');
    console.log(`AI用ゲーム数: ${aiGames.length.toLocaleString()}件`);
    console.log(`メイジン用ゲーム数: ${meijinGames.length.toLocaleString()}件`);
    console.log('');

    // IDセットを作成
    const aiGameIds = new Set(aiGames.map(game => game.game_id));
    const meijinGameIds = new Set(meijinGames.map(game => game.game_id));

    // 共通のID
    const commonIds = Array.from(aiGameIds).filter(id => meijinGameIds.has(id));

    // AI専用のID
    const aiOnlyIds = Array.from(aiGameIds).filter(id => !meijinGameIds.has(id));

    // メイジン専用のID
    const meijinOnlyIds = Array.from(meijinGameIds).filter(id => !aiGameIds.has(id));

    // 結果を出力
    console.log('🔍 比較結果');
    console.log('='.repeat(50));
    console.log(`両方に存在するID: ${commonIds.length.toLocaleString()}件`);
    console.log(`AI専用ID: ${aiOnlyIds.length.toLocaleString()}件`);
    console.log(`メイジン専用ID: ${meijinOnlyIds.length.toLocaleString()}件`);
    console.log('');

    // 詳細を表示（最初の10件ずつ）
    if (commonIds.length > 0) {
      console.log('✅ 両方に存在するID（最初の10件）:');
      commonIds.slice(0, 10).forEach(id => console.log(`  - ${id}`));
      if (commonIds.length > 10) {
        console.log(`  ... 他${(commonIds.length - 10).toLocaleString()}件`);
      }
      console.log('');
    }

    if (aiOnlyIds.length > 0) {
      console.log('🤖 AI専用ID（最初の10件）:');
      aiOnlyIds.slice(0, 10).forEach(id => console.log(`  - ${id}`));
      if (aiOnlyIds.length > 10) {
        console.log(`  ... 他${(aiOnlyIds.length - 10).toLocaleString()}件`);
      }
      console.log('');
    }

    if (meijinOnlyIds.length > 0) {
      console.log('👑 メイジン専用ID（最初の10件）:');
      meijinOnlyIds.slice(0, 10).forEach(id => console.log(`  - ${id}`));
      if (meijinOnlyIds.length > 10) {
        console.log(`  ... 他${(meijinOnlyIds.length - 10).toLocaleString()}件`);
      }
      console.log('');
    }

    // サマリー
    const totalUniqueIds = new Set([...aiGameIds, ...meijinGameIds]).size;
    console.log('📈 サマリー');
    console.log('='.repeat(50));
    console.log(`全体のユニークID数: ${totalUniqueIds.toLocaleString()}件`);
    console.log(`重複率: ${((commonIds.length / Math.min(aiGames.length, meijinGames.length)) * 100).toFixed(2)}%`);

    // 結果をJSONファイルに保存
    const result = {
      summary: {
        ai_games_count: aiGames.length,
        meijin_games_count: meijinGames.length,
        common_count: commonIds.length,
        ai_only_count: aiOnlyIds.length,
        meijin_only_count: meijinOnlyIds.length,
        total_unique_count: totalUniqueIds,
        overlap_percentage: parseFloat(((commonIds.length / Math.min(aiGames.length, meijinGames.length)) * 100).toFixed(2))
      },
      data: {
        common_ids: commonIds.sort((a, b) => b - a), // 降順でソート
        ai_only_ids: aiOnlyIds.sort((a, b) => b - a),
        meijin_only_ids: meijinOnlyIds.sort((a, b) => b - a)
      }
    };

    const outputPath = path.join(__dirname, '../output/game_comparison_result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 詳細結果を ${outputPath} に保存しました`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
compareGameLists();
