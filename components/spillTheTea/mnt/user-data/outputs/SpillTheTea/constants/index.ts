export const COLORS = {
  primary:      '#1565C0',
  background:   '#fffff',
  white:        '#fff',
  cardShadow:   '#000',
  textDark:     '#1a1a2e',
  textMid:      '#555',
  textLight:    '#888',
  textFaint:    '#9e9e9e',
  border:       '#ddd',
  divider:      '#e8e8e8',
  commentBg:    '#f4f6fb',
  avatarBg:     '#b0bec5',
  modalOverlay: 'rgba(0,0,0,0.35)',
};

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'numeric', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true,
};

export const MOCK_POSTS = [
  {
    _id: '1',
    content: 'Hi, this is amazing post',
    author: { _id: 'u1', firstName: 'acewallscholars', lastName: 'Student', role: 'student' },
    likes: ['u2'],
    comments: [],
    createdAt: new Date().toISOString(),
  },
];
