export interface Author {
  _id: string;
  firstName: string;
  lastName: string;
  role?: string;
  profileImg?: { url: string };
}

export interface Comment {
  _id: string;
  content: string;
  author: Author;
  createdAt: string;
}


export interface Asset {
  _id:      string;
  url:      string;
  fileName: string;
  type:     string;   // "image/png" | "video/mp4" etc.
}

export interface Post {
  content: string;
  totalComments: number | undefined;
  _id:          string;
  text:         string;
  assets:       Asset[];
  author:       Author;
  postType:     string;
  likes:        string[];
  comments:     Comment[];
  createdAt:    string;
  // ── From like API response ──
  totalLikes?:   number;        // ← real count from server
  userReaction?: string | null; // ← 'like' | null
}