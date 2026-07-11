// types/index.ts

export interface MessageFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface GeneratedFile {
  url: string;
  filename: string;
  FileType: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  file?: MessageFile; // ← attached file shown in bubble
  dbId?: string;
  generatedFile?: GeneratedFile | null;
  fileUsed?: string | null;
}

export type QuickReply = string;
