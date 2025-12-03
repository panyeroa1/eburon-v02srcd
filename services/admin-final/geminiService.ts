
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from './audioUtils';
import { LAURENT_SYSTEM_PROMPT } from '../../constants-admin-final';

export class GeminiLiveClient {
  private ai: GoogleGenAI | null = null;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  
  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;
  private recordedChunks: Blob[] = [];

  public onVolumeChange: ((inputVol: number, outputVol: number) => void) | null = null;
  public onClose: (() => void) | null = null;

  constructor() {
    // Client is initialized in connect()
  }

  // Updated to accept optional custom system prompt
  async connect(customSystemPrompt?: string) {
    this.disconnect(); // Clean up existing

    // Initialize AI Client here to ensure we get the latest API Key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
        console.error("API_KEY is missing in process.env");
    }
    this.ai = new GoogleGenAI({ apiKey });

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("Microphone access denied", e);
      throw e;
    }

    // Setup Recording Mixer in Output Context (Output Context is 24kHz, Input is 16kHz)
    // We mix mic stream into the output context's destination for recording purposes
    if (this.outputAudioContext && this.stream) {
        this.recordingDestination = this.outputAudioContext.createMediaStreamDestination();
        const micSource = this.outputAudioContext.createMediaStreamSource(this.stream);
        micSource.connect(this.recordingDestination);
    }

    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: this.handleOpen.bind(this),
        onmessage: this.handleMessage.bind(this),
        onerror: (e: ErrorEvent) => {
            console.error('Gemini Error:', e);
            // If the error is network related, it might be due to API Key or firewall
        },
        onclose: (e: CloseEvent) => {
            console.log('Gemini Session Closed', e);
            if(this.onClose) this.onClose();
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        // Use custom prompt if provided, else fallback to default constant
        systemInstruction: customSystemPrompt || LAURENT_SYSTEM_PROMPT,
      },
    };

    if (this.ai && this.ai.live) {
        this.sessionPromise = this.ai.live.connect(config);
    }
  }

  private handleOpen() {
    console.log('Gemini Live Connected');
    
    // Ensure contexts are running (needed for some browsers)
    if (this.inputAudioContext && this.inputAudioContext.state === 'suspended') {
        this.inputAudioContext.resume();
    }
    if (this.outputAudioContext && this.outputAudioContext.state === 'suspended') {
        this.outputAudioContext.resume();
    }

    if (!this.inputAudioContext || !this.stream) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    // Buffer size 4096 gives ~0.25s latency at 16kHz
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate input volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      if(this.onVolumeChange) this.onVolumeChange(rms * 5, 0); // Temporary output 0

      const pcmBlob = createPcmBlob(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

    if (base64Audio && this.outputAudioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        this.outputAudioContext,
        24000,
        1
      );

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      const gainNode = this.outputAudioContext.createGain();
      
      // Simple visualization hook for output
      const analyser = this.outputAudioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(gainNode);
      gainNode.connect(analyser);
      
      // Connect to Speakers
      gainNode.connect(this.outputAudioContext.destination);
      
      // Connect to Recording Stream if active
      if (this.recordingDestination) {
          gainNode.connect(this.recordingDestination);
      }

      // We need to poll the analyser for volume data during playback if we want precise visualization
      // For simplicity in this demo, we can just trigger "activity"
      if(this.onVolumeChange) {
          this.onVolumeChange(0, 0.5); 
          setTimeout(() => { if(this.onVolumeChange) this.onVolumeChange(0, 0); }, audioBuffer.duration * 1000);
      }

      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      console.log("Model interrupted");
      this.stopAllAudio();
    }
  }

  private stopAllAudio() {
    this.sources.forEach(s => {
        try { s.stop(); } catch(e) {}
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  startRecording() {
    if (!this.recordingDestination) return;
    this.recordedChunks = [];
    
    // Create recorder from the mixed stream
    try {
        this.mediaRecorder = new MediaRecorder(this.recordingDestination.stream);
    } catch (e) {
        console.error("MediaRecorder init failed", e);
        return;
    }

    this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            this.recordedChunks.push(e.data);
        }
    };
    
    this.mediaRecorder.start();
    console.log("Recording started");
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve) => {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            resolve('');
            return;
        }

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            this.recordedChunks = [];
            resolve(url);
        };
        
        this.mediaRecorder.stop();
        console.log("Recording stopped");
    });
  }

  disconnect() {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    
    this.sessionPromise = null;
    this.mediaRecorder = null;
    this.recordingDestination = null;
  }
}

export const geminiClient = new GeminiLiveClient();
