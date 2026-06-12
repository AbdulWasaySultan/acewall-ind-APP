
import { Author } from '../../../../..';
import { DATE_FORMAT_OPTIONS } from '../constants';

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', DATE_FORMAT_OPTIONS);

export const getFullName = (author?: Author) =>
  [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Unknown';

export const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const toggleLike = (likes: string[], userId: string) =>
  likes.includes(userId)
    ? likes.filter((id) => id !== userId)
    : [...likes, userId];
