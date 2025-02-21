import { NextRequest, NextResponse } from 'next/server';
import { TranslationService } from '@/lib/translation-service';

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json();

    if (!text || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const translationService = TranslationService.getInstance();
    const translated = await translationService.translateText(text, {
      from: from || 'en',
      to
    });

    return NextResponse.json({ 
      translated,
      source: from || 'en',
      target: to
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = url.searchParams.get('text');
  const from = url.searchParams.get('from') || 'en';
  const to = url.searchParams.get('to');

  if (!text || !to) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const translationService = TranslationService.getInstance();
    const translated = await translationService.translateText(text, {
      from,
      to
    });

    return NextResponse.json({
      translated,
      source: from,
      target: to
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
