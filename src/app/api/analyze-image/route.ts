import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 30;

/** Cursor 설정 > Models > Google 에 넣는 키와 동일한 키 사용 (Google AI Studio 키) */
const apiKey = process.env.GEMINI_API_KEY ?? process.env.CURSOR_API_KEY;

/** 이미지 base64 → 분위기/장르 설명 + 플레이리스트용 키워드 반환 (Gemini Vision) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType = 'image/jpeg' } = body as {
      imageBase64: string;
      mimeType?: string;
    };

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY 또는 CURSOR_API_KEY를 .env.local에 설정해 주세요. (Cursor 설정 > Models > Google 키와 동일)',
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a music curator. Look at this image and respond in JSON only, no markdown, with this exact structure:
{
  "mood": "short mood in 2-4 words (e.g. calm sunset, rainy cafe)",
  "genreHints": ["genre1", "genre2", "genre3"],
  "description": "One short sentence describing the scene/vibe for the user (same language as the user's likely locale - support Korean or English)"
}
Describe the mood, atmosphere, and suggest 2-3 music genres that would fit.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const raw = (response.text ?? '').trim() || '{}';
    // JSON 블록만 추출 (```json ... ``` 제거)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: { mood?: string; genreHints?: string[]; description?: string };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { mood: 'chill', genreHints: ['ambient', 'indie'], description: raw };
    }

    return NextResponse.json({
      mood: parsed.mood ?? 'chill',
      genreHints: Array.isArray(parsed.genreHints)
        ? parsed.genreHints
        : ['ambient', 'indie'],
      description: parsed.description ?? 'Perfect for this moment.',
    });
  } catch (err) {
    console.error('analyze-image error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
