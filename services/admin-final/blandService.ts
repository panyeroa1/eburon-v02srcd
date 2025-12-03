
import { AgentPersona } from '../../types-admin-final';
import { BLAND_AUTH, BLAND_SETTINGS, generateSystemPrompt } from '../../constants-admin-final';

export class BlandService {
  
  async initiateCall(
    phoneNumber: string, 
    persona: AgentPersona
  ): Promise<{ status: string, call_id: string, message?: string }> {
    
    // Generate the Laurent De Wilde persona prompt
    const taskPrompt = persona.systemPrompt || generateSystemPrompt(persona);

    const payload = {
      phone_number: phoneNumber,
      voice: persona.voiceId || BLAND_SETTINGS.voiceId,
      wait_for_greeting: false,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: true,
      interruption_threshold: 500,
      block_interruptions: false,
      max_duration: 37.7, // As per snippet
      model: persona.model || BLAND_SETTINGS.model,
      language: BLAND_SETTINGS.language,
      background_track: "office",
      endpoint: "https://api.bland.ai",
      voicemail_action: "hangup",
      from: BLAND_SETTINGS.fromNumber,
      tools: persona.tools && persona.tools.length > 0 ? persona.tools : BLAND_SETTINGS.tools,
      // We explicitly set the task (System Prompt) and First Sentence
      task: taskPrompt, 
      first_sentence: persona.firstSentence || `Hi, this is ${persona.name}, a broker here in Belgium — you left your number on my site earlier, so I just wanted to personally see how I can help you with your property or search.`,
      temperature: 0.6
    };

    try {
      const response = await fetch('https://api.bland.ai/v1/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': BLAND_AUTH.apiKey,
          'encrypted_key': BLAND_AUTH.encryptedKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Bland AI API Call Failed", error);
      return { status: "error", call_id: "", message: error.message };
    }
  }

  // Hook for monitoring if we implement the Live Socket visualization later
  async listenToCall(callId: string): Promise<string | null> {
      try {
           const res = await fetch(`https://api.bland.ai/v1/calls/${callId}/listen`, {
                method: 'POST',
                headers: { 'Authorization': BLAND_AUTH.apiKey }
            });
            const data = await res.json();
            if(data.status === "success" && data.data && data.data.url) {
                return data.data.url;
            }
            return null;
      } catch(e) {
          console.error("Failed to get listen URL", e);
          return null;
      }
  }

  // Fetch actual call details including recording_url
  async getCallDetails(callId: string): Promise<any> {
      try {
          const response = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
              method: 'GET',
              headers: {
                  'Authorization': BLAND_AUTH.apiKey,
                  'encrypted_key': BLAND_AUTH.encryptedKey
              }
          });
          
          if (!response.ok) {
              throw new Error(`Error fetching call details: ${response.statusText}`);
          }

          const data = await response.json();
          return data;
      } catch (error) {
          console.error("Failed to fetch call details", error);
          return null;
      }
  }
}

export const blandService = new BlandService();
