import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  MediaResolution,
  TurnCoverage,
} from '@google/genai';

// Types for the service
export interface GeminiLiveConfig {
  apiKey: string;
  voiceName?: string;
  systemInstruction?: string;
}

export class GeminiLiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isConnected: boolean = false;
  private audioQueue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private nextPlayTime: number = 0;
  
  // Callbacks
  public onConnect?: () => void;
  public onDisconnect?: () => void;
  public onUserSpeaking?: () => void;
  public onAgentSpeaking?: () => void;
  public onError?: (error: any) => void;

  constructor(config: GeminiLiveConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async connect(config: GeminiLiveConfig) {
    try {
      const model = 'models/gemini-2.0-flash-exp'; // Using the latest experimental model for live
      
      const tools = [{ googleSearch: {} }];

      const sessionConfig = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: config.voiceName || 'Aoede',
            },
          },
        },
        realtimeInputConfig: {
          turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT,
        },
        tools,
        systemInstruction: {
          parts: [{ text: config.systemInstruction || 'You are a helpful assistant.' }],
        },
      };

      this.session = await this.client.live.connect({
        model,
        config: sessionConfig,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            this.isConnected = true;
            this.onConnect?.();
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onclose: (e: CloseEvent) => {
            console.log('Gemini Live Closed', e);
            this.disconnect();
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live Error', e);
            this.onError?.(e);
          },
        },
      });

      // Start audio input immediately upon connection
      await this.startAudioInput();

    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      this.onError?.(error);
      throw error;
    }
  }

  private handleMessage(message: LiveServerMessage) {
    if (message.serverContent?.modelTurn?.parts) {
      const parts = message.serverContent.modelTurn.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/pcm')) {
          // Handle Audio Response
          this.onAgentSpeaking?.();
          const base64 = part.inlineData.data;
          if (base64) {
            const pcmData = this.base64ToFloat32(base64);
            this.queueAudio(pcmData);
          }
        }
        if (part.text) {
          console.log('Agent Text:', part.text);
        }
      }
    }
    
    if (message.serverContent?.turnComplete) {
      // Turn complete logic if needed
    }
  }

  private async startAudioInput() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // Gemini prefers 16kHz
      });

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Use ScriptProcessor for simplicity (AudioWorklet is better for prod but requires separate file)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.isConnected || !this.session) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to Int16 (PCM)
        const pcmData = this.float32ToInt16(inputData);
        const base64 = this.arrayBufferToBase64(pcmData.buffer);

        // Send to Gemini
        this.session.sendRealtimeInput([{
          mimeType: 'audio/pcm;rate=16000',
          data: base64
        }]);
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination); // Connect to destination to keep it alive (mute it if needed)

    } catch (error) {
      console.error('Error starting audio input:', error);
      this.onError?.(error);
    }
  }

  private queueAudio(pcmData: Float32Array) {
    this.audioQueue.push(pcmData);
    if (!this.isPlaying) {
      this.playQueue();
    }
  }

  private async playQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    
    if (!this.audioContext) return;

    const pcmData = this.audioQueue.shift();
    if (!pcmData) return;

    const buffer = this.audioContext.createBuffer(1, pcmData.length, 24000); // Gemini output is usually 24kHz
    buffer.getChannelData(0).set(pcmData);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    // Schedule playback
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextPlayTime);
    
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;

    source.onended = () => {
      this.playQueue();
    };
  }

  disconnect() {
    this.isConnected = false;
    
    if (this.session) {
      this.session.close();
      this.session = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.onDisconnect?.();
  }

  // --- Helpers ---

  private float32ToInt16(float32: Float32Array): Int16Array {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }

  private base64ToFloat32(base64: string): Float32Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
