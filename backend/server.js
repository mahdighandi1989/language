import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini Chat API
app.post('/api/gemini/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const payload = req.body;

    // Clean payload - remove extra fields that Gemini doesn't recognize
    if (payload.contents) {
      payload.contents = payload.contents.map(content => ({
        role: content.role,
        parts: content.parts.map(part => ({
          text: part.text
        }))
      }));
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(500).json({ error: 'No text in response' });
    }

    res.json({ text });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gemini TTS API
app.post('/api/gemini/tts', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { prompt, voice = 'Kore' } = req.body;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: voice } 
          } 
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const result = await response.json();
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType?.startsWith("audio/")) {
      res.json({ audioData, mimeType });
    } else {
      res.status(500).json({ error: 'Invalid audio data' });
    }
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Gemini API directly
app.get('/api/test-gemini', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured', keyExists: false });
  }

  try {
    const testPayload = {
      contents: [{ role: 'user', parts: [{ text: 'Say hello in Lebanese Arabic' }] }]
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    console.log('Gemini test response status:', response.status);
    console.log('Gemini test response:', responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Gemini API failed',
        status: response.status,
        response: responseText,
        keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
      });
    }

    const result = JSON.parse(responseText);
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({
      success: true,
      text: text,
      keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
