export type PostTarget = 'public' | 'course';

export interface MediaFile {
  uri:  string;
  type: 'photo' | 'video';
  name: string;
}

export interface CreatePostPayload {
  content: string;
  target:  PostTarget;
  media:   MediaFile[];
}
