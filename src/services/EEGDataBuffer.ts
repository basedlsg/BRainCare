import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'eeg-buffer',
  encryptionKey: 'braincare-secure-key', // In prod, manage this key securely
});

interface EEGSession {
  sessionId: string;
  startTime: number;
  data: string[]; // Array of hex strings or raw values
  isUploaded: boolean;
}

class EEGDataBuffer {
  private currentSessionId: string | null = null;
  private currentBuffer: string[] = [];
  private readonly FLUSH_THRESHOLD = 100; // Flush to MMKV every 100 packets

  startSession(): string {
    this.currentSessionId = `session_${Date.now()}`;
    this.currentBuffer = [];
    console.log('[EEGBuffer] Session started:', this.currentSessionId);

    // Initialize session record
    const session: EEGSession = {
      sessionId: this.currentSessionId,
      startTime: Date.now(),
      data: [],
      isUploaded: false,
    };
    storage.set(this.currentSessionId, JSON.stringify(session));

    // Add to session list index
    const sessions = this.getSessionList();
    sessions.push(this.currentSessionId);
    storage.set('session_index', JSON.stringify(sessions));

    return this.currentSessionId;
  }

  appendData(packet: string): void {
    if (!this.currentSessionId) return; // Drop data if no session active

    this.currentBuffer.push(packet);

    if (this.currentBuffer.length >= this.FLUSH_THRESHOLD) {
      this.flush();
    }
  }

  async stopSession(): Promise<void> {
    if (!this.currentSessionId) return;

    console.log('[EEGBuffer] Stopping session:', this.currentSessionId);
    this.flush();

    // Trigger "Upload" job (mocked)
    await this.uploadSession(this.currentSessionId);

    this.currentSessionId = null;
  }

  private flush(): void {
    if (!this.currentSessionId || this.currentBuffer.length === 0) return;

    try {
      const existingJson = storage.getString(this.currentSessionId);
      if (existingJson) {
        const session: EEGSession = JSON.parse(existingJson);
        session.data.push(...this.currentBuffer);
        storage.set(this.currentSessionId, JSON.stringify(session));
      }
      this.currentBuffer = []; // Clear RAM buffer
    } catch (e) {
      console.error('[EEGBuffer] Flush failed:', e);
    }
  }

  private getSessionList(): string[] {
    const listJson = storage.getString('session_index');
    return listJson ? JSON.parse(listJson) : [];
  }

  private async uploadSession(sessionId: string): Promise<void> {
    console.log(`[EEGBuffer] ☁️ Uploading session ${sessionId}...`);
    // Mock Async Upload
    setTimeout(() => {
      console.log(`[EEGBuffer] ✅ Session ${sessionId} uploaded successfully.`);
      // Mark as uploaded
      const json = storage.getString(sessionId);
      if (json) {
        const session: EEGSession = JSON.parse(json);
        session.isUploaded = true;
        storage.set(sessionId, JSON.stringify(session));
      }
    }, 2000);
  }
}

export default new EEGDataBuffer();
