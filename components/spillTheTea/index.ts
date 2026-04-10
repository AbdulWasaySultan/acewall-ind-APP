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

export interface Post {
  _id: string;
  content: string;
  author: Author;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}
