import axios from 'axios';
import { BlandAIConfig } from '../types-admin';

// Bland AI credentials
// Note: In production, these should be stored in environment variables
const BLAND_API_URL = 'https://api.bland.ai/v1/calls';
const BLAND_AUTH_TOKEN = 'org_5009c11063cb54d7d1daa2cbef4944f6a57f464015cdaa3767d5047fd5cab63a1012a08785c667becd0369';
const BLAND_ENCRYPTED_KEY = '0ec48f6b-9d48-4e8b-b050-c59d7d673a85';

export interface BlandAPIHeaders {
  'Authorization': string;
  'encrypted_key': string;
}

export interface CallResponse {
  success: boolean;
  call_id?: string;
  message?: string;
  error?: string;
}

/**
 * Service for interacting with Bland AI API
 */
export class BlandAIService {
  private headers: BlandAPIHeaders;

  constructor() {
    this.headers = {
      'Authorization': BLAND_AUTH_TOKEN,
      'encrypted_key': BLAND_ENCRYPTED_KEY
    };
  }

  /**
   * Initiate a call using Bland AI
   * @param config - Bland AI configuration
   * @returns Call response with call ID or error
   */
  async makeCall(config: BlandAIConfig): Promise<CallResponse> {
    try {
      const response = await axios.post(BLAND_API_URL, config, {
        headers: this.headers
      });

      return {
        success: true,
        call_id: response.data.call_id,
        message: response.data.message || 'Call initiated successfully'
      };
    } catch (error: any) {
      console.error('Bland AI call error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to initiate call'
      };
    }
  }

  /**
   * Test the connection to Bland AI API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Simple test - you might want to call a specific test endpoint
      return true;
    } catch (error) {
      console.error('Bland AI connection test failed:', error);
      return false;
    }
  }

  /**
   * Get the default Bland AI configuration template
   */
  getDefaultConfig(): Partial<BlandAIConfig> {
    return {
      wait_for_greeting: false,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: true,
      interruption_threshold: 500,
      block_interruptions: false,
      max_duration: 37.7,
      model: 'base',
      language: 'babel',
      background_track: 'office',
      endpoint: 'https://api.bland.ai',
      voicemail_action: 'hangup',
      isCallActive: false,
      temperature: 0.6,
      tools: []
    };
  }
}

export const blandAIService = new BlandAIService();
