// types/index.ts

export interface MessageFile {
  uri:   string;
  name:  string;
  type:  string;
  size?: number;
}

export interface Message {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: Date;
  file?:     MessageFile;   // ← attached file shown in bubble
}

export type QuickReply = string;