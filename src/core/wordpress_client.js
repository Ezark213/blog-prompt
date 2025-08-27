const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');

// ロガー設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/wordpress_client.log' })
  ]
});

class WordPressClient {
  constructor() {
    this.apiUrl = process.env.WORDPRESS_API_URL || 'https://ezark-tax-accounting.com/wp-json/wp/v2';
    this.username = process.env.WORDPRESS_USERNAME;
    this.password = process.env.WORDPRESS_APP_PASSWORD;
    this.siteUrl = process.env.SITE_URL || 'https://ezark-tax-accounting.com';
    
    this.inputDir = path.join(__dirname, '../../outputs/generated_content');
    this.outputDir = path.join(__dirname, '../../outputs/published_posts');
    
    // Basic認証ヘッダー
    this.authHeader = {
      'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * 記事をWordPressに投稿
   */
  async publishArticle(articleData) {
    try {
      logger.info(`記事投稿開始: ${articleData.title}`);
      
      // カテゴリ・タグの準備
      const categories = await this.ensureCategories(articleData.categories);
      const tags = await this.ensureTags(articleData.tags);
      
      // 記事投稿
      const post = await this.createPost({
        title: articleData.title,
        content: articleData.content,
        slug: articleData.slug,
        meta_description: articleData.metaDescription,
        categories: categories,
        tags: tags,
        focusKeyword: articleData.focusKeyword
      });
      
      // スキーママークアップ追加
      if (articleData.schema) {
        await this.addSchemaMarkup(post.id, articleData.schema);
      }
      
      // Yoast SEO メタデータ設定
      await this.setYoastMetadata(post.id, {
        focusKeyword: articleData.focusKeyword,
        metaDescription: articleData.metaDescription,
        title: articleData.title
      });
      
      const publishedPost = {
        ...articleData,
        wordpressId: post.id,
        publishedUrl: post.link,
        publishedAt: new Date().toISOString(),
        status: 'published'
      };
      
      // 公開記録を保存
      await this.savePublishedRecord(publishedPost);
      
      logger.info(`記事投稿完了: ${articleData.title} (ID: ${post.id})`);
      return publishedPost;

    } catch (error) {
      logger.error(`記事投稿エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * 記事作成
   */
  async createPost(postData) {
    try {
      const payload = {
        title: postData.title,
        content: postData.content,
        slug: postData.slug,
        status: 'publish', // 'draft' for drafts
        categories: postData.categories,
        tags: postData.tags,
        author: await this.getAuthorId('ゆーた'),
        excerpt: postData.meta_description,
        meta: {
          _yoast_wpseo_metadesc: postData.meta_description,
          _yoast_wpseo_focuskw: postData.focusKeyword,
          _yoast_wpseo_title: postData.title
        }
      };

      const response = await axios.post(`${this.apiUrl}/posts`, payload, {
        headers: this.authHeader
      });

      logger.info(`記事作成成功: ID ${response.data.id}`);
      return response.data;

    } catch (error) {
      logger.error(`記事作成エラー: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  /**
   * カテゴリ確認・作成
   */
  async ensureCategories(categoryNames) {
    const categoryIds = [];
    
    for (const categoryName of categoryNames) {
      try {
        // 既存カテゴリ検索
        const existingResponse = await axios.get(`${this.apiUrl}/categories`, {
          params: { search: categoryName },
          headers: this.authHeader
        });
        
        if (existingResponse.data.length > 0) {
          categoryIds.push(existingResponse.data[0].id);
          logger.info(`既存カテゴリ使用: ${categoryName} (ID: ${existingResponse.data[0].id})`);
        } else {
          // カテゴリ作成
          const createResponse = await axios.post(`${this.apiUrl}/categories`, {
            name: categoryName,
            slug: this.generateSlug(categoryName)
          }, {
            headers: this.authHeader
          });
          
          categoryIds.push(createResponse.data.id);
          logger.info(`カテゴリ作成: ${categoryName} (ID: ${createResponse.data.id})`);
        }
      } catch (error) {
        logger.warn(`カテゴリ処理エラー: ${categoryName} - ${error.message}`);
      }
    }
    
    return categoryIds;
  }

  /**
   * タグ確認・作成
   */
  async ensureTags(tagNames) {
    const tagIds = [];
    
    for (const tagName of tagNames) {
      try {
        // 既存タグ検索
        const existingResponse = await axios.get(`${this.apiUrl}/tags`, {
          params: { search: tagName },
          headers: this.authHeader
        });
        
        if (existingResponse.data.length > 0) {
          tagIds.push(existingResponse.data[0].id);
          logger.info(`既存タグ使用: ${tagName} (ID: ${existingResponse.data[0].id})`);
        } else {
          // タグ作成
          const createResponse = await axios.post(`${this.apiUrl}/tags`, {
            name: tagName,
            slug: this.generateSlug(tagName)
          }, {
            headers: this.authHeader
          });
          
          tagIds.push(createResponse.data.id);
          logger.info(`タグ作成: ${tagName} (ID: ${createResponse.data.id})`);
        }
      } catch (error) {
        logger.warn(`タグ処理エラー: ${tagName} - ${error.message}`);
      }
    }
    
    return tagIds;
  }

  /**
   * 著者ID取得
   */
  async getAuthorId(authorName) {
    try {
      const response = await axios.get(`${this.apiUrl}/users`, {
        params: { search: authorName },
        headers: this.authHeader
      });
      
      return response.data.length > 0 ? response.data[0].id : 1; // デフォルト: 1
    } catch (error) {
      logger.warn(`著者ID取得エラー: ${error.message}`);
      return 1; // デフォルト著者ID
    }
  }

  /**
   * スキーママークアップ追加
   */
  async addSchemaMarkup(postId, schemaJson) {
    try {
      const schemaScript = `
<!-- Schema.org JSON-LD -->
<script type="application/ld+json">
${schemaJson}
</script>
`;

      // カスタムフィールドとしてスキーマを保存
      await this.updatePostMeta(postId, '_schema_markup', schemaScript);
      
      logger.info(`スキーママークアップ追加完了: Post ID ${postId}`);
    } catch (error) {
      logger.error(`スキーママークアップ追加エラー: ${error.message}`);
    }
  }

  /**
   * Yoast SEO メタデータ設定
   */
  async setYoastMetadata(postId, seoData) {
    try {
      const metaData = {
        '_yoast_wpseo_title': seoData.title,
        '_yoast_wpseo_metadesc': seoData.metaDescription,
        '_yoast_wpseo_focuskw': seoData.focusKeyword,
        '_yoast_wpseo_meta-robots-noindex': '0',
        '_yoast_wpseo_meta-robots-nofollow': '0',
        '_yoast_wpseo_opengraph-title': seoData.title,
        '_yoast_wpseo_opengraph-description': seoData.metaDescription,
        '_yoast_wpseo_twitter-title': seoData.title,
        '_yoast_wpseo_twitter-description': seoData.metaDescription
      };

      for (const [key, value] of Object.entries(metaData)) {
        await this.updatePostMeta(postId, key, value);
      }

      logger.info(`Yoast SEOメタデータ設定完了: Post ID ${postId}`);
    } catch (error) {
      logger.error(`Yoast SEOメタデータ設定エラー: ${error.message}`);
    }
  }

  /**
   * カスタムフィールド更新
   */
  async updatePostMeta(postId, metaKey, metaValue) {
    try {
      await axios.post(`${this.apiUrl}/posts/${postId}/meta`, {
        meta_key: metaKey,
        meta_value: metaValue
      }, {
        headers: this.authHeader
      });
    } catch (error) {
      logger.warn(`メタデータ更新エラー: ${metaKey} - ${error.message}`);
    }
  }

  /**
   * 記事を下書き状態で作成
   */
  async createDraft(articleData) {
    try {
      const draftData = { ...articleData, status: 'draft' };
      const draft = await this.createPost(draftData);
      
      logger.info(`下書き作成完了: ${articleData.title} (ID: ${draft.id})`);
      return draft;
    } catch (error) {
      logger.error(`下書き作成エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * 下書きを公開
   */
  async publishDraft(postId) {
    try {
      const response = await axios.post(`${this.apiUrl}/posts/${postId}`, {
        status: 'publish'
      }, {
        headers: this.authHeader
      });

      logger.info(`下書き公開完了: Post ID ${postId}`);
      return response.data;
    } catch (error) {
      logger.error(`下書き公開エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * 公開記録保存
   */
  async savePublishedRecord(publishedPost) {
    await fs.ensureDir(this.outputDir);
    const fileName = publishedPost.sourceFile.replace(/\.[^/.]+$/, '_published.json');
    const outputPath = path.join(this.outputDir, fileName);
    
    await fs.writeJson(outputPath, publishedPost, { spaces: 2 });
    logger.info(`公開記録保存完了: ${outputPath}`);
    
    return outputPath;
  }

  /**
   * 全生成記事の投稿
   */
  async publishAllGeneratedArticles() {
    try {
      const contentFiles = await fs.readdir(this.inputDir);
      const results = [];
      
      for (const file of contentFiles) {
        if (file.endsWith('_content.json')) {
          const filePath = path.join(this.inputDir, file);
          const articleData = await fs.readJson(filePath);
          
          const publishedPost = await this.publishArticle(articleData);
          results.push(publishedPost);
          
          // 投稿間隔（API制限対策）
          await this.delay(2000);
        }
      }
      
      logger.info(`${results.length}個の記事を投稿しました`);
      return results;
      
    } catch (error) {
      logger.error(`バッチ投稿エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * 記事の更新
   */
  async updatePost(postId, updateData) {
    try {
      const response = await axios.post(`${this.apiUrl}/posts/${postId}`, updateData, {
        headers: this.authHeader
      });

      logger.info(`記事更新完了: Post ID ${postId}`);
      return response.data;
    } catch (error) {
      logger.error(`記事更新エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * 記事の削除
   */
  async deletePost(postId) {
    try {
      const response = await axios.delete(`${this.apiUrl}/posts/${postId}`, {
        headers: this.authHeader,
        params: { force: true } // 完全削除
      });

      logger.info(`記事削除完了: Post ID ${postId}`);
      return response.data;
    } catch (error) {
      logger.error(`記事削除エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * WordPressサイト情報取得
   */
  async getSiteInfo() {
    try {
      const response = await axios.get(this.apiUrl.replace('/wp/v2', ''));
      return response.data;
    } catch (error) {
      logger.error(`サイト情報取得エラー: ${error.message}`);
      throw error;
    }
  }

  // ユーティリティメソッド
  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ひらがなカタカナ漢字\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 接続テスト
   */
  async testConnection() {
    try {
      logger.info('WordPress接続テスト開始...');
      
      const siteInfo = await this.getSiteInfo();
      logger.info(`接続成功: ${siteInfo.name}`);
      
      // 記事一覧取得テスト
      const postsResponse = await axios.get(`${this.apiUrl}/posts`, {
        params: { per_page: 1 },
        headers: this.authHeader
      });
      logger.info(`記事取得テスト成功: ${postsResponse.data.length}件取得`);
      
      return true;
    } catch (error) {
      logger.error(`接続テスト失敗: ${error.message}`);
      return false;
    }
  }
}

// 直接実行時の処理
if (require.main === module) {
  const client = new WordPressClient();
  
  // 接続テスト
  client.testConnection()
    .then(success => {
      if (success) {
        console.log('✅ WordPress接続成功');
        // 実際の投稿処理
        return client.publishAllGeneratedArticles();
      } else {
        throw new Error('WordPress接続失敗');
      }
    })
    .then(results => {
      console.log('✅ 記事投稿完了:', results.length);
      results.forEach(post => {
        console.log(`  - ${post.title}: ${post.publishedUrl}`);
      });
    })
    .catch(error => {
      console.error('❌ エラー:', error.message);
      process.exit(1);
    });
}

module.exports = WordPressClient;