export interface Message {
  id: string;
  content: string;
  role: "user" | "model";
  session_id: string | null;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
}

export interface SessionResponse {
  session_id: string;
  title: string;
  timestamp: string;
}
