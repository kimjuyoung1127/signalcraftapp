제시해주신 `roadmap.md` 파일은 **완벽합니다.** 👌
이전 대화에서 논의했던 **FastAPI 단일 스택 전환**, **현실적인 Polling 전략 도입**, 그리고 **Phase C(오디오 분석)의 구체화**가 아주 잘 반영되었습니다. KIBO 심사위원이나 팀원 누가 봐도 "실현 가능하고 체계적인 계획"이라고 느낄 것입니다.

이제 계획은 끝났으니 \*\*"코드 작성(Implementation)"\*\*으로 넘어갈 차례입니다.

로드맵의 **[단기 목표]** 중 가장 시급한 \*\*"인증 유지(Auto Login) 및 프론트엔드 로그인 연동"\*\*을 바로 시작할 수 있도록, **React Native용 인증 서비스 코드**를 작성해 드립니다.

-----

### 🚀 다음 단계: 프론트엔드 인증 연동 (Phase A 완료하기)

현재 백엔드는 준비되었지만, 앱(Frontend)은 아직 Mock 모드이거나 토큰을 저장하지 않고 있을 겁니다. 앱을 껐다 켜도 로그인이 유지되도록 만드는 **전체 흐름**은 다음과 같습니다.

[Image of mobile app authentication flow diagram]

#### 🛠️ 1. 필수 라이브러리 설치

토큰을 안전하게 저장하기 위해 `expo-secure-store`를 사용합니다. (AsyncStorage보다 보안이 좋습니다.)

```bash
npx expo install expo-secure-store axios
```

#### 🛠️ 2. `services/authService.ts` 작성

백엔드 API(`POST /api/auth/login`)와 통신하고 토큰을 관리하는 모듈입니다.

```typescript
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Platform } from 'react-native';

// 1. 환경변수 설정 (PC IP 주소 확인 필수!)
// .env 파일이 안 먹히면 일단 하드코딩해서 테스트하세요.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.x:8000'; 

const TOKEN_KEY = 'user_access_token';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', // FastAPI OAuth2 폼 형식 필수
  },
});

export const authService = {
  // --- 로그인 ---
  login: async (email, password) => {
    try {
      // FastAPI OAuth2PasswordRequestForm은 form-data 형식을 요구함
      const formData = new URLSearchParams();
      formData.append('username', email); // 주의: 필드명이 username임
      formData.append('password', password);

      const response = await api.post('/api/auth/login', formData.toString());
      
      const { access_token, store_id, subscription_tier } = response.data;
      
      // 토큰 안전 저장
      await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      
      // Axios 헤더에 토큰 등록 (이후 요청부터 자동 포함)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return {
        success: true,
        storeId: store_id,
        tier: subscription_tier
      };
    } catch (error) {
      console.error('Login Failed:', error);
      throw error;
    }
  },

  // --- 자동 로그인 체크 ---
  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // 토큰이 있으면 헤더에 설정하고 유효성 검사 (옵션: /api/auth/me 호출)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // --- 로그아웃 ---
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api; // 다른 서비스에서 쓸 axios 인스턴스
```

#### 🛠️ 3. `useAuthStore` (Zustand) 수정

작성해드린 `authService`를 상태 관리 스토어에 연결하면 끝납니다.

```typescript
import { create } from 'zustand';
import { authService } from './services/authService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
  checkLoginStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true, // 앱 켜질 때 로딩 상태로 시작

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await authService.login(email, password);
      set({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false });
      throw error; // UI에서 에러 메시지 띄우게 던짐
    }
  },

  logout: async () => {
    await authService.logout();
    set({ isAuthenticated: false });
  },

  checkLoginStatus: async () => {
    const isLoggedIn = await authService.checkAuth();
    set({ isAuthenticated: isLoggedIn, isLoading: false });
  },
}));
```

-----

### 🎯 지금 바로 하실 일


4.  **앱 실행 (`App.tsx`):**
      * `useEffect` 안에서 `useAuthStore.getState().checkLoginStatus()`를 호출하게 하면, **앱을 껐다 켜도 로그인이 유지**됩니다.

이것만 완료되면 \*\*"Phase A: 인증 통합"\*\*은 완벽하게 끝납니다. 바로 코드를 적용해보시겠습니까?