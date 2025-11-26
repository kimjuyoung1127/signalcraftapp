export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://172.30.1.73:8000'; // PC IP address - change to your actual IP
export const IS_DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export const ENV = {
  API_BASE_URL,
  IS_DEMO_MODE,
};
