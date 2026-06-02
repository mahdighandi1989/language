import { GEMINI_API_KEY } from '../config/env.js';
import { redactSensitiveData } from '../utils/redact.js';

// validation: structural guard for Gemini generateContent responses. The
// upstream API is trusted to be well-formed, but the anti-pattern we are
// fixing is returning `result` straight to the client with no structural
// check. A genuine response always carries a non-empty `candidates` array;
// anything else (error envelope, unexpected shape, hostile payload) must not
// be forwarded verbatim.
function isValidGeminiResponse(result) {
  return (
    result !== null &&
    typeof result === 'object' &&
    Array.isArray(result.candidates) &&
    result.candidates.length > 0
  );
}

// sanitize: strip a Gemini generateContent response down to the fields the
// client actually consumes (text + audio inline data) so we never relay
// unexpected or sensitive top-level fields from the upstream payload.
function sanitizeGeminiResponse(result) {
  const candidates = (result.candidates || []).map((candidate) => ({
    content: {
      role: candidate?.content?.role,
      parts: (candidate?.content?.parts || []).map((part) => {
        if (part?.inlineData || part?.inline_data) {
          return { inlineData: part.inlineData || part.inline_data };
        }
        if (part?.text !== undefined) {
          return { text: part.text };
        }
        return null;
      }).filter((p) => p !== null),
    },
  }));
  return { candidates };
}

// POST /api/gemini/chat — proxy a chat request to Gemini, optionally returning
// the full response (with audio) or just the generated text.
export async function chat(req, res) {
  try {
    const payload = req.body;
    const includeAudio = payload.includeAudio;
    delete payload.includeAudio;

    // Clean payload - preserve audio data if includeAudio flag is set
    if (payload.contents) {
      payload.contents = payload.contents.map((content) => ({
        role: content.role,
        parts: content.parts.map((part) => {
          // Keep inline_data (audio) if present
          if (part.inline_data && includeAudio) {
            return { inline_data: part.inline_data };
          }
          // Keep text if present
          if (part.text !== undefined) {
            return { text: part.text };
          }
          return null;
        }).filter((p) => p !== null),
      }));
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', redactSensitiveData(errorData));
      return res.status(response.status).json({ error: redactSensitiveData(errorData) });
    }

    const result = await response.json();

    // validation: reject malformed/unexpected upstream payloads instead of
    // forwarding them blindly to the client.
    if (!isValidGeminiResponse(result)) {
      console.error('Gemini API returned an unexpected response shape');
      return res.status(502).json({ error: 'Invalid response from AI service' });
    }

    // Return full result for audio requests, just text otherwise
    if (includeAudio) {
      // sanitize the validated result so only known fields reach the client.
      res.json(sanitizeGeminiResponse(result));
    } else {
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return res.status(500).json({ error: 'No text in response' });
      }
      res.json({ text });
    }
  } catch (error) {
    console.error('Chat API error:', redactSensitiveData(error?.message || String(error)));
    res.status(500).json({ error: redactSensitiveData(error?.message || 'Internal Server Error') });
  }
}

// POST /api/gemini/tts — synthesize speech for the given prompt and voice.
export async function tts(req, res) {
  try {
    const { prompt, voice = 'Kore' } = req.body;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS API error:', redactSensitiveData(errorData));
      return res.status(response.status).json({ error: redactSensitiveData(errorData) });
    }

    const result = await response.json();
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType?.startsWith('audio/')) {
      res.json({ audioData, mimeType });
    } else {
      res.status(500).json({ error: 'Invalid audio data' });
    }
  } catch (error) {
    console.error('TTS API error:', redactSensitiveData(error?.message || String(error)));
    res.status(500).json({ error: redactSensitiveData(error?.message || 'Internal Server Error') });
  }
}

// GET /api/health — liveness probe.
export function health(req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

// GET /api/gemini/status — authenticated configuration status.
export function status(req, res) {
  res.json({ status: 'ok', configured: Boolean(GEMINI_API_KEY) });
}

// GET /api/list-models — list available Gemini model names.
export async function listModels(req, res) {
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: redactSensitiveData(data) });
    }

    // Return just model names for easier reading
    const modelNames = data.models?.map((m) => m.name) || [];
    res.json({ models: modelNames, count: modelNames.length });
  } catch (error) {
    res.status(500).json({ error: redactSensitiveData(error.message) });
  }
}

// GET /api/test-gemini — sanity-check the Gemini API with a fixed prompt.
export async function testGemini(req, res) {
  try {
    const testPayload = {
      contents: [{ role: 'user', parts: [{ text: 'Say hello in Lebanese Arabic' }] }],
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log('Testing Gemini API with URL:', redactSensitiveData(apiUrl));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    console.log('Gemini test response status:', response.status);
    console.log('Gemini test response:', redactSensitiveData(responseText));

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Gemini API failed',
        status: response.status,
        response: redactSensitiveData(responseText),
      });
    }

    const result = JSON.parse(responseText);
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({
      success: true,
      text: text,
    });
  } catch (error) {
    console.error('Test error:', redactSensitiveData(error.message));
    res.status(500).json({ error: redactSensitiveData(error.message) });
  }
}
