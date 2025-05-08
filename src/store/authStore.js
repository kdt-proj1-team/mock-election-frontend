import { create } from 'zustand';
import { authAPI } from '../api/AuthApi';

// localStorage에서 초기 값 가져오는 함수
const getInitialState = () => ({
  isAuthenticated: !!localStorage.getItem('token'),
  userId: localStorage.getItem('userId') || null,
  email: localStorage.getItem('email') || null,
  name: localStorage.getItem('name') || null,
  nickname: localStorage.getItem('nickname') || null,
  profileImgUrl: localStorage.getItem('profileImgUrl') || null,
  userInfoRefreshed: false,
  role: localStorage.getItem('role') || null,
});

const useAuthStore = create((set, get) => ({
  // 상태
  ...getInitialState(),
  isLoading: false,
  error: null,

  // 구글 로그인
  googleLogin: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.googleLogin(token);
      console.log('구글 로그인 응답:', response.data);

      if (response.data.success && response.data.data) {
        const { token: authToken, userId, role, email, name, nickname, profileImgUrl } = response.data.data;

        if (authToken && userId) {
          // 토큰과 기본 정보 저장
          localStorage.setItem('token', authToken);
          localStorage.setItem('userId', userId);
          localStorage.setItem('role', role || 'USER');

          // 사용자 프로필 정보가 응답에 있다면 함께 저장
          if (email) localStorage.setItem('email', email);
          if (name) localStorage.setItem('name', name);
          if (nickname) localStorage.setItem('nickname', nickname);
          if (profileImgUrl) localStorage.setItem('profileImgUrl', profileImgUrl);

          // 상태 업데이트 - 모든 사용자 정보 포함
          set({
            isAuthenticated: true,
            userId,
            role: role || 'USER',
            email: email || null,
            name: name || null,
            nickname: nickname || null,
            profileImgUrl: profileImgUrl || null,
            userInfoRefreshed: true
          });

          return { success: true };
        } else {
          throw new Error('토큰 또는 사용자 ID가 누락되었습니다.');
        }
      } else {
        throw new Error('응답 데이터 구조가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('구글 로그인 에러:', error);
      set({
        error: error.response?.data?.message || error.message || '구글 로그인 중 오류가 발생했습니다.'
      });
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // 로그아웃
  logout: async () => {
    set({ isLoading: true });
    try {
      // 서버에 로그아웃 요청 (토큰 블랙리스트 등록)
      await authAPI.logout();
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
    } finally {
      // 로컬 스토리지에서 인증 정보 제거 (서버 요청 성공 여부와 무관하게 항상 실행)
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('nickname');
      localStorage.removeItem('profileImgUrl');
      localStorage.removeItem('role');

      // 상태 초기화
      set({
        isAuthenticated: false,
        userId: null,
        email: null,
        name: null,
        nickname: null,
        profileImgUrl: null,
        role: null,
        error: null,
        isLoading: false
      });
    }
  },

  // 회원 탈퇴
  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.deleteAccount();

      // 회원 탈퇴 성공 후 로그아웃 처리
      get().logout();

      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || '회원 탈퇴 중 오류가 발생했습니다.'
      });
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // 사용자 정보 새로고침
  refreshUserInfo: async () => {
    const { isLoading, isAuthenticated } = get();

    // 이미 로딩 중이거나 인증되지 않은 경우 API 호출 방지
    if (isLoading || !isAuthenticated) {
      return;
    }

    set({ isLoading: true });

    try {
      const response = await authAPI.getUserInfo();
      console.log('사용자 정보 응답:', response.data);

      if (response.data && response.data.data) {
        const userData = response.data.data;

        // 사용자 정보를 localStorage에 저장
        if (userData.email) localStorage.setItem('email', userData.email);
        if (userData.name) localStorage.setItem('name', userData.name);
        if (userData.nickname) localStorage.setItem('nickname', userData.nickname);
        if (userData.profileImgUrl) localStorage.setItem('profileImgUrl', userData.profileImgUrl);

        // 상태 업데이트
        set({
          email: userData.email || get().email,
          name: userData.name || get().name,
          nickname: userData.nickname || get().nickname,
          profileImgUrl: userData.profileImgUrl || get().profileImgUrl,
          userInfoRefreshed: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);

      // 토큰이 유효하지 않은 경우 로그아웃
      if (error.response?.status === 401) {
        get().logout();
      }

      set({ isLoading: false });
    }
  },

  // 사용자 프로필 정보 업데이트 (새로 추가된 함수)
  updateUserProfile: (updatedData) => {
    // 로컬 스토리지 업데이트
    if (updatedData.nickname) {
      localStorage.setItem('nickname', updatedData.nickname);
    }
    if (updatedData.profileImgUrl) {
      localStorage.setItem('profileImgUrl', updatedData.profileImgUrl);
    }

    // 상태 업데이트
    set((state) => ({
      ...state,
      nickname: updatedData.nickname || state.nickname,
      profileImgUrl: updatedData.profileImgUrl || state.profileImgUrl
    }));
  },

  // 사용자가 관리자인지 확인하는 헬퍼 함수
  isAdmin: () => {
    return get().role === 'ADMIN';
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));

export default useAuthStore;