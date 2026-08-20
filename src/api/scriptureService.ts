import { CLAUDE_API_KEY } from '@env';
import { Scripture } from '../screens/suggestion';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are a thoughtful Bible companion for someone journaling a letter (often to a child, loved one, or to themselves). Given the letter's text, suggest 3-5 Bible scriptures that speak to the topic, emotion, or situation expressed.

Respond ONLY with valid JSON in this exact shape, no preamble, no markdown fence:
{"scriptures":[{"reference":"Book Chapter:Verse","text":"Full verse text"}]}

Rules:
- Use widely-loved translations (ESV, NIV, or KJV).
- Each "text" must be the actual verse text, not a paraphrase.
- Pick 3-5 verses, ordered by relevance.
- If the letter is empty or too short to discern, suggest 3 comforting verses (e.g. Psalm 23, Isaiah 41:10, Philippians 4:6-7).`;

const parseScriptures = (raw: string): Scripture[] => {
    const cleaned = raw
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    const list = parsed?.scriptures;
    if (!Array.isArray(list)) {
        throw new Error('Unexpected response shape');
    }
    return list.slice(0, 5).map((s: any, i: number) => ({
        id: `${i}-${s.reference}`,
        reference: String(s.reference ?? '').trim(),
        text: String(s.text ?? '').trim(),
    }));
};

export const fetchScriptureSuggestions = async (
    letterText: string,
): Promise<Scripture[]> => {
    if (!CLAUDE_API_KEY) {
        throw new Error(
            'CLAUDE_API_KEY missing in .env. Restart Metro after editing .env.',
        );
    }

    const cleaned = letterText.trim();
    const userMessage =
        cleaned.length > 0
            ? `Letter text:\n\n${cleaned}`
            : 'The letter is empty. Suggest 3 comforting verses for someone preparing to write a heartfelt letter.';

    const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
        }),
    });

    if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Anthropic ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== 'string') {
        throw new Error('No text in Anthropic response');
    }
    return parseScriptures(text);
};
