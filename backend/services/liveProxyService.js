import { WebSocket } from 'ws';
import { GEMINI_API_KEY } from '../config/env.js';
import { defaultLivePrompts } from './prompts.js';

const GEMINI_LIVE_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_LIVE_WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

// Attaches the Gemini Live API WebSocket proxy to the given WebSocketServer.
// Each client connection opens a paired upstream connection to Gemini and
// bidirectionally forwards messages, injecting a Lebanese-dialect system
// instruction on setup.
export function attachLiveProxy(wss) {
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

    const sendSetupMessage = (voiceName = 'Charon', context = '', accentMode = 'authentic', corrections = '', customPrompts = null) => {
      if (isSetupSent) return;
      isSetupSent = true;

      // Helper to get prompt (custom or default)
      const getPrompt = (key) => (customPrompts && customPrompts[key]) ? customPrompts[key] : defaultLivePrompts[key];

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
        ? getPrompt('liveVoiceSimplified') + ' '
        : getPrompt('liveVoiceAuthentic') + ' ';

      const systemText = `${getPrompt('liveVoiceIntro')}
${contextPart}${correctionsPart}
${getPrompt('liveVoiceRules')}
${accentInstruction}

${getPrompt('liveVoicePronunciation')}

${getPrompt('liveVoiceVocabulary')}

${getPrompt('liveVoiceVerbs')}

${getPrompt('liveVoiceExpressions')}

${getPrompt('liveVoiceExamples')}

${getPrompt('liveVoiceStyle')}

${getPrompt('liveVoiceImportantRules')}

${getPrompt('liveVoiceClosing')}`;

      const setupMessage = {
        setup: {
          model: `models/${GEMINI_LIVE_MODEL}`,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName,
                },
              },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: {
            parts: [{ text: systemText }],
          },
        },
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

    // A non-101 handshake response (e.g. 401/403 from a bad API key, or a 5xx)
    // arrives as 'unexpected-response'. Without this listener 'ws' would still
    // emit 'error', but here we can relay the HTTP status code so the client
    // gets an actionable message instead of a generic socket error.
    geminiWs.on('unexpected-response', (_request, response) => {
      const status = response?.statusCode ?? 'unknown';
      console.error('Gemini WebSocket unexpected response, status:', status);
      clientWs.send(JSON.stringify({ error: `اتصال به Gemini Live ناموفق بود (HTTP ${status})` }));
      geminiWs.terminate();
    });

    geminiWs.on('close', (code, reason) => {
      const reasonStr = reason?.toString() || 'Unknown';
      console.log('Gemini connection closed - Code:', code, 'Reason:', reasonStr);
      clientWs.send(JSON.stringify({
        type: 'disconnected',
        error: `اتصال Gemini قطع شد (${code}): ${reasonStr}`,
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
          console.log('Client requested setup with voice:', message.voice, 'context:', message.context || 'none', 'corrections:', message.corrections ? 'yes' : 'no', 'customPrompts:', message.customPrompts ? 'yes' : 'no');
          sendSetupMessage(message.voice || 'Charon', message.context || '', message.accentMode || 'authentic', message.corrections || '', message.customPrompts || null);
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
}

export default attachLiveProxy;
