export interface DigiLockerConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface DigiLockerAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface DigiLockerDocument {
  id: string;
  type: string;
  name: string;
  date: string;
  issuer: string;
  uri: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
}

export class DigiLockerService {
  private config: DigiLockerConfig;
  private baseUrl = 'https://api.digitallocker.gov.in/public/oauth2/1';

  constructor(config: DigiLockerConfig) {
    this.config = config;
  }

  async getAccessToken(code: string): Promise<DigiLockerAccessToken> {
    const response = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    return response.json();
  }

  async getUserDocuments(accessToken: string): Promise<DigiLockerDocument[]> {
    const response = await fetch(`${this.baseUrl}/records`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    return data.documents || [];
  }

  async verifyDocument(accessToken: string, documentUri: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uri: documentUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Document verification failed');
    }

    const result = await response.json();
    return result.verified === true;
  }
}

// Export types
export type { DigiLockerDocument as DigiLockerAuth };

// Create and export default instance
export const digilocker = new DigiLockerService({
  clientId: process.env.DIGILOCKER_CLIENT_ID || '',
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || '',
  redirectUri: process.env.DIGILOCKER_REDIRECT_URI || ''
});
