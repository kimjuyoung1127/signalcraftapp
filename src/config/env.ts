export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const IS_DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export const ENV = {
  API_BASE_URL,
  IS_DEMO_MODE,
};
