import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ProtocolSchema, SYSTEM_PROMPT } from '../lib/schema.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'transcript ist erforderlich' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY nicht konfiguriert' });
  }

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const { object } = await generateObject({
      model:  anthropic('claude-sonnet-4-6'),
      schema: ProtocolSchema,
      system: SYSTEM_PROMPT,
      mode: "tool",
      prompt: 'Protokoll:\n\n' + transcript,
    });

    return res.status(200).json(object);
  } catch (err) {
    console.error('[analyze]', err);
    return res.status(500).json({ error: err.message });
  }
}
