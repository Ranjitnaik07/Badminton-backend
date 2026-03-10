export const API_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://your-production-api.com';

export const COLORS = {
  primary: '#0095F6',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#8E8E8E',
  lightGray: '#DBDBDB',
  background: '#FAFAFA',
  danger: '#ED4956',
  success: '#4CAF50',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};
