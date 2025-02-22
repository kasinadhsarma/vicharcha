interface TranslationCache {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

interface TranslationResponse {
  translated: string;
  source: string;
  target: string;
}

const translationCache: TranslationCache = {};

export interface TranslateOptions {
  from?: string;
  to: string;
  cache?: boolean;
}

export class TranslationService {
  private static instance: TranslationService;

  private constructor() {}

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private async translate(text: string, from: string, to: string): Promise<string> {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          from,
          to
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json() as TranslationResponse;
      return data.translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  public async translateText(
    text: string, 
    options: TranslateOptions
  ): Promise<string> {
    const from = options.from || 'en';
    const to = options.to;
    const useCache = options.cache !== false;

    // Return original text if languages are the same
    if (from === to) return text;

    // Check cache first if enabled
    if (useCache) {
      const cached = translationCache[from]?.[to]?.[text] || null;
      if (cached) return cached;
    }

    const translated = await this.translate(text, from, to);

    // Cache the result if caching is enabled
    if (useCache && translated !== text) {
      if (!translationCache[from]) {
        translationCache[from] = {
          [to]: {
            [text]: translated
          }
        };
      } else if (!translationCache[from][to]) {
        translationCache[from][to] = {
          [text]: translated
        };
      } else {
        translationCache[from][to][text] = translated;
      }
    }

    return translated;
  }
}
