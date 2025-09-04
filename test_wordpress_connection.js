const axios = require('axios');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔗 WordPress API接続テスト開始...');
    console.log('URL:', process.env.WORDPRESS_API_URL);
    console.log('ユーザー名:', process.env.WORDPRESS_USERNAME);
    
    const response = await axios.get(process.env.WORDPRESS_API_URL, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ WordPress API接続成功');
    console.log('ステータス:', response.status);
    console.log('利用可能なエンドポイント数:', Object.keys(response.data.routes).length);
    
    // 投稿エンドポイントの確認
    if (response.data.routes['/wp/v2/posts']) {
      console.log('✅ 投稿エンドポイント利用可能');
    } else {
      console.log('❌ 投稿エンドポイント未発見');
    }
    
  } catch (error) {
    console.error('❌ WordPress API接続エラー:');
    console.error('ステータス:', error.response?.status);
    console.error('メッセージ:', error.response?.data?.message || error.message);
    console.error('URL:', process.env.WORDPRESS_API_URL);
    
    if (error.response?.status === 401) {
      console.error('🔐 認証エラー: WordPressのユーザー名・パスワードを確認してください');
    }
  }
}

testConnection();