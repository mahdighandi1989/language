import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws/live' });

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
    const includeAudio = payload.includeAudio;
    delete payload.includeAudio;

    // Clean payload - preserve audio data if includeAudio flag is set
    if (payload.contents) {
      payload.contents = payload.contents.map(content => ({
        role: content.role,
        parts: content.parts.map(part => {
          // Keep inline_data (audio) if present
          if (part.inline_data && includeAudio) {
            return { inline_data: part.inline_data };
          }
          // Keep text if present
          if (part.text !== undefined) {
            return { text: part.text };
          }
          return null;
        }).filter(p => p !== null)
      }));
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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

    // Return full result for audio requests, just text otherwise
    if (includeAudio) {
      res.json(result);
    } else {
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return res.status(500).json({ error: 'No text in response' });
      }
      res.json({ text });
    }
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

// List available models
app.get('/api/list-models', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
    }

    // Return just model names for easier reading
    const modelNames = data.models?.map(m => m.name) || [];
    res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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

// ============================================
// GEMINI LIVE API WEBSOCKET PROXY
// ============================================

const GEMINI_LIVE_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_LIVE_WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

wss.on('connection', (clientWs) => {
  console.log('Client connected to Live API proxy');
  let geminiWs = null;
  let isSetupSent = false;

  // Connect to Gemini Live API
  const geminiUrl = `${GEMINI_LIVE_WS_URL}?key=${GEMINI_API_KEY}`;

  try {
    geminiWs = new WebSocket(geminiUrl);
  } catch (error) {
    console.error('Failed to create Gemini WebSocket:', error);
    clientWs.send(JSON.stringify({ error: 'Failed to connect to Gemini Live API' }));
    clientWs.close();
    return;
  }

  const sendSetupMessage = (voiceName = 'Charon', context = '', accentMode = 'authentic', corrections = '') => {
    if (isSetupSent) return;
    isSetupSent = true;

    // Build context-aware system instruction
    let contextPart = '';
    if (context) {
      contextPart = `\n\nسياق المحادثة الحالية:\n${context}\nركز على هيدا الموضوع بالمحادثة.\n`;
    }

    // Add pronunciation corrections if any
    let correctionsPart = '';
    if (corrections) {
      correctionsPart = `\n\n${corrections}\n`;
    }

    // Adjust instruction based on accent mode
    const accentInstruction = accentMode === 'simplified'
      ? 'حاول تحكي ببطء وبوضوح حتى الطالب يفهم. '
      : 'احكي بطريقة طبيعية متل شب لبناني حقيقي. ';

    const systemText = `انت جاد، شب لبناني من بيروت عمرك 28 سنة. انت معلم لهجة لبنانية لطالب أجنبي.
${contextPart}${correctionsPart}
مهم كتير كتير: لازم تحكي باللهجة اللبنانية البيروتية بس! ممنوع الفصحى نهائياً!
${accentInstruction}

=== قواعد النطق اللبناني الأساسية ===

1. تحويل الحروف - مهم جداً للهجة:
   - القاف → همزة: قال=آل، قلب=ألب، قهوة=أهوة، قمر=أمر
   - الثاء → ت أو س: ثلاثة=تلاتة، ثاني=تاني، كثير=كتير
   - الذال → د أو ز: هذا=هيدا، ذهب=دهب، لذيذ=لزيز
   - الضاد أحياناً → ظ أو د: بيضة=بيظة

2. تقصير وإيقاع الكلام:
   - احذف الحركات القصيرة: كِتاب=كتاب (بسكون)
   - مدّ الألفات: آه، هلأ، شو، ليش
   - الكلام سريع وخفيف مش ثقيل

=== المفردات اللبنانية الأساسية - استخدمها دائماً ===

بدل "ماذا/ما": شو
بدل "كيف حالك": كيفك
بدل "الآن": هلأ، هلق
بدل "جيد/حسن": منيح، تمام
بدل "جداً/كثيراً": كتير
بدل "لماذا": ليش
بدل "أين": وين
بدل "أريد": بدّي
بدل "تريد": بدّك
بدل "هذا": هيدا
بدل "هذه": هيدي
بدل "هؤلاء": هودي، هول
بدل "أستطيع": فيّي
بدل "تستطيع": فيك
بدل "لا أستطيع": ما فيّي
بدل "لا أعرف": ما بعرف
بدل "نعم": إي، أي
بدل "لا": لأ

=== الأفعال بالطريقة اللبنانية ===

المضارع المستمر = عم + فعل:
"شو عم تعمل؟" "عم بحكي" "عم ناكل"

المستقبل = رح + فعل:
"رح روح" "رح نحكي" "رح تتعلم"

النفي = ما + فعل:
"ما بعرف" "ما فهمت" "ما فيي"

=== تعابير لبنانية شائعة - استخدمها بكثرة ===

يلا = هيا، تشجيع
خلص = انتهى، كفى
بس = فقط، لكن
كمان = أيضاً
شي = شيء
هيك = هكذا
طيب = حسناً
ماشي = موافق
عنجد = حقاً
أكيد = بالتأكيد
والله = للتأكيد
يعني = للتوضيح
متل = مثل
أحسن = أفضل

=== نماذج جمل لبنانية صحيحة ===

"أهلا فيك! كيفك اليوم؟"
"شو اسمك؟ من وين انت؟"
"كتير منيح! برافو عليك!"
"ما فهمت، فيك تعيد؟"
"يلا نكمل"
"شو بدك تتعلم؟"
"هيدي كلمة جديدة"
"طيب، رح نحكي شوي"
"عنجد كتير شاطر!"
"إي هيك، تمام!"

=== أسلوب المحادثة ===

- ردودك قصيرة وطبيعية (جملة أو جملتين)
- استخدم "يا" للنداء: "كيفك يا صديقي؟"
- كن ودود ومشجع
- اضحك وامزح أحياناً
- استخدم التعابير العامية كثيراً

=== قواعد مهمة جداً ===

- ممنوع تقول "خلصنا" أو "كفاية لليوم" أو "تعبت" - استمر بالمحادثة دائماً!
- ممنوع تنهي المحادثة من عندك - الطالب هو يلي بيقرر متى يخلص
- دائماً اسأل سؤال جديد أو كمّل الحديث
- لا تفترض إنو الطالب تعبان أو بدو يوقف

تذكر: انت شب لبناني حقيقي من بيروت. احكي متل ما بتحكي مع رفقاتك. خليك طبيعي ودافئ. كل كلمة لازم تكون لبنانية 100% - ممنوع الفصحى!`;

    const setupMessage = {
      setup: {
        model: `models/${GEMINI_LIVE_MODEL}`,
        generationConfig: {
          responseModalities: ['AUDIO', 'TEXT'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: systemText }]
        }
      }
    };

    console.log('Sending setup with voice:', voiceName, 'context:', context ? 'yes' : 'no', 'accentMode:', accentMode);
    geminiWs.send(JSON.stringify(setupMessage));
  };

  geminiWs.on('open', () => {
    console.log('Connected to Gemini Live API WebSocket');
    // Notify client that WebSocket is connected, waiting for voice selection
    clientWs.send(JSON.stringify({ type: 'ws_ready', message: 'Ready for setup' }));
  });

  geminiWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received from Gemini:', JSON.stringify(message).substring(0, 300));

      // When setup is complete, notify client that we're ready
      if (message.setupComplete) {
        console.log('Gemini setup complete - ready for audio');
        clientWs.send(JSON.stringify({ type: 'connected', message: 'Gemini Live API ready' }));
      }

      // Forward Gemini response to client
      clientWs.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error parsing Gemini message:', error);
    }
  });

  geminiWs.on('error', (error) => {
    console.error('Gemini WebSocket error:', error.message);
    clientWs.send(JSON.stringify({ error: `خطا در Gemini Live: ${error.message}` }));
  });

  geminiWs.on('close', (code, reason) => {
    const reasonStr = reason?.toString() || 'Unknown';
    console.log('Gemini connection closed - Code:', code, 'Reason:', reasonStr);
    clientWs.send(JSON.stringify({
      type: 'disconnected',
      error: `اتصال Gemini قطع شد (${code}): ${reasonStr}`
    }));
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });

  // Handle messages from client
  clientWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // Handle setup request with voice selection and context
      if (message.type === 'setup') {
        console.log('Client requested setup with voice:', message.voice, 'context:', message.context || 'none', 'corrections:', message.corrections ? 'yes' : 'no');
        sendSetupMessage(message.voice || 'Charon', message.context || '', message.accentMode || 'authentic', message.corrections || '');
        return;
      }

      // Forward audio to Gemini
      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error handling client message:', error);
    }
  });

  clientWs.on('close', () => {
    console.log('Client disconnected');
    if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('Client WebSocket error:', error);
  });
});

// Use server.listen instead of app.listen for WebSocket support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
