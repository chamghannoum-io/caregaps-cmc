/**
 * Webhook Service
 * Handles communication with n8n via CORS proxy
 */

const PROXY_URL = 'http://localhost:3002';
const WEBHOOK_ID = '97f934a7-db3a-478f-a0f0-1cebca68112d';

export const webhookService = {
  /**
   * Trigger n8n webhook with patient data to get questionnaire (calls webhook, gets response)
   */
  async fetchQuestionnaire(patientData: string): Promise<any> {
    console.log('Triggering n8n webhook with patient data...');
    console.log('Patient data length:', patientData.length, 'characters');

    try {
      const response = await fetch(`${PROXY_URL}/webhook/${WEBHOOK_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_questionnaire',
          source: 'nurse_interface',
          patientData: patientData,
          timestamp: new Date().toISOString()
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch questionnaire: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received questionnaire data from n8n:', data);

      return data;
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      throw error;
    }
  },

  /**
   * Submit questionnaire responses back to n8n resume URL
   */
  async submitResponses(responses: any, resumeUrl?: string): Promise<any> {
    console.log('Submitting responses to n8n...');
    console.log('Responses:', responses);
    console.log('Resume URL:', resumeUrl);

    try {
      // If resumeUrl is provided, send directly to it (for webhook-waiting)
      // Otherwise, use the standard webhook endpoint
      const targetUrl = resumeUrl 
        ? `${PROXY_URL}/resume`
        : `${PROXY_URL}/webhook/${WEBHOOK_ID}`;

      const payload = resumeUrl 
        ? { resumeUrl, data: responses }
        : responses;

      console.log('Target URL:', targetUrl);
      console.log('Payload:', payload);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Submit response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Submit error:', errorData);
        throw new Error(errorData.error || `Failed to submit responses: ${response.status}`);
      }

      const result = await response.json().catch(() => ({ success: true }));
      console.log('Submit successful:', result);
      return result;
    } catch (error) {
      console.error('Error submitting responses:', error);
      throw error;
    }
  },
};
