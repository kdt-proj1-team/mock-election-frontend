// src/store/walletStore.js
import { create } from 'zustand';
import { ethers } from 'ethers';
import MetaMaskUtil from '../utils/MetaMaskUtil';
import { walletAPI } from '../api/WalletApi';
import useAuthStore from './authStore';

const useWalletStore = create((set, get) => ({
    // 지갑 상태
    isWalletConnected: false,
    walletAddress: null,
    tokenBalance: 0,
    provider: null,
    signer: null,
    isLoading: false,
    error: null,

    // 상태 초기화
    resetState: () => {
        set({
            isWalletConnected: false,
            walletAddress: null,
            tokenBalance: 0,
            provider: null,
            signer: null,
            isLoading: false,
            error: null
        });
    },

    // 로딩 상태 설정
    setLoading: (isLoading) => {
        set({ isLoading });
    },

    // 에러 상태 설정
    setError: (error) => {
        set({ error });
    },

    // 에러 초기화
    clearError: () => set({ error: null }),

    // 메타마스크 연결 함수
    connectMetaMask: async () => {
        try {
            set({ isLoading: true, error: null });

            // 로그인 상태 확인
            const { isAuthenticated } = useAuthStore.getState();
            if (!isAuthenticated) {
                throw new Error("로그인이 필요합니다.");
            }

            // 메타마스크 연결
            const address = await MetaMaskUtil.connectMetaMask();
            console.log("[WalletStore] 메타마스크 지갑 주소:", address);

            // ethers 프로바이더 및 사이너 설정
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // 백엔드에 지갑 주소 저장 요청
            const response = await walletAPI.connectWallet(address);

            if (!response.data.success) {
                throw new Error(response.data.message || "지갑 연결에 실패했습니다.");
            }

            // 백엔드에서 반환한 토큰 잔액 가져오기
            const tokenBalance = response.data.data.tokenBalance || 0;
            console.log("[WalletStore] 지갑 연결 후 토큰 잔액:", tokenBalance);

            // 지갑 연결 성공 후 상태 업데이트
            set({
                isWalletConnected: true,
                walletAddress: address,
                tokenBalance: tokenBalance,  // 백엔드 응답의 tokenBalance 사용
                provider: provider,
                signer: signer,
                isLoading: false,
                error: null
            });

            // 메타마스크 계정 변경 이벤트 리스너 등록
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // 메타마스크에서 연결 해제된 경우
                    get().disconnectWallet();
                } else {
                    // 계정이 변경된 경우
                    get().updateWalletAddress(accounts[0]);
                }
            });

            return { success: true, address, tokenBalance };
        } catch (error) {
            console.error("[WalletStore] 메타마스크 연결 오류:", error);

            // 상세 오류 로깅
            if (error.response) {
                console.log('[WalletStore] 상태 코드:', error.response.status);
                console.log('[WalletStore] 응답 데이터:', error.response.data);
            }

            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || "메타마스크 연결 중 오류가 발생했습니다."
            });
            throw error;
        }
    },

    // 새 지갑 생성 함수
    createNewWallet: async () => {
        try {
            set({ isLoading: true, error: null });

            // 로그인 상태 확인
            const { isAuthenticated } = useAuthStore.getState();
            if (!isAuthenticated) {
                throw new Error("로그인이 필요합니다.");
            }

            // 랜덤 지갑 생성
            const wallet = MetaMaskUtil.createNewWallet();
            const address = wallet.address;
            const privateKey = wallet.privateKey;
            console.log("[WalletStore] 새 지갑 생성:", address);

            // 백엔드에 새 지갑 주소 저장 요청
            const response = await walletAPI.createWallet(address, privateKey);

            if (!response.data.success) {
                throw new Error(response.data.message || "지갑 생성에 실패했습니다.");
            }

            // 백엔드에서 반환한 토큰 잔액 가져오기
            const tokenBalance = response.data.data.tokenBalance || 0;
            console.log("[WalletStore] 지갑 생성 후 토큰 잔액:", tokenBalance);

            // 지갑 생성 성공 후 상태 업데이트
            set({
                isWalletConnected: true,
                walletAddress: address,
                tokenBalance: tokenBalance,  // 백엔드 응답의 tokenBalance 사용
                // 새로 생성된 지갑은 provider, signer 없이 읽기 전용으로 사용
                provider: null,
                signer: null,
                isLoading: false,
                error: null
            });

            return { success: true, address, mnemonic: wallet.mnemonic, tokenBalance };
        } catch (error) {
            console.error("[WalletStore] 지갑 생성 오류:", error);

            // 상세 오류 로깅
            if (error.response) {
                console.log('[WalletStore] 상태 코드:', error.response.status);
                console.log('[WalletStore] 응답 데이터:', error.response.data);
            }

            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || "지갑 생성 중 오류가 발생했습니다."
            });
            throw error;
        }
    },

    // 지갑 연결 해제 함수
    disconnectWallet: async () => {
        try {
            set({ isLoading: true, error: null });

            // 로그인 상태이고 지갑이 연결된 경우에만 백엔드 호출
            const { isAuthenticated } = useAuthStore.getState();
            const { isWalletConnected } = get();

            if (isAuthenticated && isWalletConnected) {
                try {
                    await walletAPI.disconnectWallet();
                    console.log('[WalletStore] 지갑 연결 해제 API 호출 성공');
                } catch (error) {
                    console.error("[WalletStore] 지갑 연결 해제 API 호출 오류:", error);
                    // 오류가 발생해도 계속 진행 (클라이언트 측 연결 해제는 수행)
                }
            }

            // 이벤트 리스너 제거
            if (window.ethereum && window.ethereum.removeAllListeners) {
                window.ethereum.removeAllListeners('accountsChanged');
            }

            // 상태 초기화
            set({
                isWalletConnected: false,
                walletAddress: null,
                tokenBalance: 0,
                provider: null,
                signer: null,
                error: null,
                isLoading: false
            });

            return { success: true };
        } catch (error) {
            console.error("[WalletStore] 지갑 연결 해제 오류:", error);

            set({
                isLoading: false,
                error: error.message || "지갑 연결 해제 중 오류가 발생했습니다."
            });

            // 에러가 발생해도 로컬 상태는 초기화
            set({
                isWalletConnected: false,
                walletAddress: null,
                tokenBalance: 0,
                provider: null,
                signer: null
            });

            return { success: false };
        }
    },

    // 토큰 잔액 새로고침 함수
    refreshTokenBalance: async () => {
        try {
            set({ isLoading: true, error: null });

            // 로그인 상태 확인
            const { isAuthenticated } = useAuthStore.getState();
            if (!isAuthenticated) {
                throw new Error("로그인이 필요합니다.");
            }

            // 지갑이 연결되어 있는지 확인
            const { isWalletConnected } = get();
            if (!isWalletConnected) {
                throw new Error("지갑이 연결되어 있지 않습니다.");
            }

            // 백엔드에서 최신 토큰 잔액 가져오기
            const response = await walletAPI.getTokenBalance();

            if (!response.data.success) {
                throw new Error(response.data.message || "토큰 잔액 조회에 실패했습니다.");
            }

            // 백엔드에서 반환한 토큰 잔액 가져오기
            const balance = response.data.data.balance || 0;
            console.log("[WalletStore] 새로 조회한 토큰 잔액:", balance);

            // 상태 업데이트
            set({
                tokenBalance: balance,  // API 응답의 balance 사용
                isLoading: false,
                error: null
            });

            return { success: true, balance };
        } catch (error) {
            console.error("[WalletStore] 토큰 잔액 새로고침 오류:", error);

            set({
                isLoading: false,
                error: error.message || "토큰 잔액 새로고침 중 오류가 발생했습니다."
            });

            return { success: false, error: error.message };
        }
    },

    // 초기 로드 시 지갑 상태 체크
    checkWalletStatus: async () => {
        try {
            set({ isLoading: true, error: null });

            const { isAuthenticated } = useAuthStore.getState();

            if (!isAuthenticated) {
                set({ isLoading: false });
                return { success: false, message: "로그인이 필요합니다.", connected: false };
            }

            // 로그인한 사용자의 지갑 정보 조회
            const response = await walletAPI.getWalletStatus();
            console.log("[WalletStore] 지갑 상태 조회 응답:", response.data);

            if (response.data.success) {
                // 연결 여부와 관계없이 데이터 업데이트
                const walletData = response.data.data || {};

                // 연결된 경우
                if (walletData.connected) {
                    // 중요: 토큰 잔액 로깅 및 상태 업데이트
                    console.log("[WalletStore] 현재 토큰 잔액:", walletData.tokenBalance);

                    set({
                        isWalletConnected: true,
                        walletAddress: walletData.walletAddress,
                        tokenBalance: walletData.tokenBalance, // 백엔드 응답의 tokenBalance 사용
                        isLoading: false
                    });

                    // 메타마스크가 있으면 지갑 연결 시도
                    if (MetaMaskUtil.isMetaMaskInstalled()) {
                        try {
                            const accounts = await MetaMaskUtil.getAccounts();

                            if (accounts.length > 0 && accounts[0].toLowerCase() === walletData.walletAddress.toLowerCase()) {
                                // 메타마스크에 연결된 계정이 있고, 저장된 지갑 주소와 일치하면 프로바이더 설정
                                const provider = new ethers.providers.Web3Provider(window.ethereum);
                                const signer = provider.getSigner();

                                set({
                                    provider,
                                    signer
                                });

                                // 메타마스크 계정 변경 이벤트 리스너 등록
                                window.ethereum.on('accountsChanged', (accounts) => {
                                    if (accounts.length === 0) {
                                        get().disconnectWallet();
                                    } else {
                                        get().updateWalletAddress(accounts[0]);
                                    }
                                });
                            }
                        } catch (metaMaskError) {
                            console.error("[WalletStore] 메타마스크 상태 확인 중 오류:", metaMaskError);
                            // 메타마스크 오류는 무시하고 진행 (지갑은 연결된 상태로 유지)
                        }
                    }
                } else {
                    // 연결되지 않은 경우
                    set({
                        isWalletConnected: false,
                        walletAddress: null,
                        tokenBalance: 0,
                        provider: null,
                        signer: null,
                        isLoading: false
                    });
                }

                return {
                    success: true,
                    connected: !!walletData.connected,
                    tokenBalance: walletData.tokenBalance || 0
                };
            } else {
                // API 응답은 성공했지만, 비즈니스 로직 실패 (success: false)
                set({
                    isWalletConnected: false,
                    walletAddress: null,
                    tokenBalance: 0,
                    provider: null,
                    signer: null,
                    isLoading: false,
                    error: response.data.message || "지갑 상태를 확인할 수 없습니다."
                });

                return {
                    success: false,
                    connected: false,
                    message: response.data.message || "지갑 상태를 확인할 수 없습니다."
                };
            }
        } catch (error) {
            console.error("[WalletStore] 지갑 상태 확인 오류:", error);

            // 네트워크 또는 API 오류 처리
            let errorMessage = "지갑 상태 확인 중 오류가 발생했습니다.";

            if (error.response) {
                // 서버 응답이 있는 경우
                errorMessage = error.response.data?.message || `서버 오류: ${error.response.status}`;
                console.log("[WalletStore] 지갑 API 응답 오류:", error.response.status, error.response.data);
            } else if (error.request) {
                // 요청은 보냈지만 응답이 없는 경우
                errorMessage = "서버 연결 오류. 네트워크를 확인해주세요.";
                console.log("[WalletStore] 지갑 API 요청 오류:", error.request);
            } else {
                // 요청 설정 중 오류 발생
                errorMessage = `요청 설정 오류: ${error.message}`;
            }

            // 에러 상태와 함께 모든 관련 상태 리셋
            set({
                isLoading: false,
                error: errorMessage,
                isWalletConnected: false,
                walletAddress: null,
                tokenBalance: 0,
                provider: null,
                signer: null
            });

            return {
                success: false,
                connected: false,
                message: errorMessage
            };
        }
    },

    // 지갑 주소 업데이트 함수
    updateWalletAddress: async (newAddress) => {
        try {
            set({ isLoading: true, error: null });

            // 백엔드에 지갑 주소 업데이트 요청
            const response = await walletAPI.updateWallet(newAddress);

            if (!response.data.success) {
                throw new Error(response.data.message || "지갑 주소 업데이트에 실패했습니다.");
            }

            // 백엔드에서 반환한 토큰 잔액 가져오기
            const tokenBalance = response.data.data.tokenBalance || 0;
            console.log("[WalletStore] 지갑 주소 업데이트 후 토큰 잔액:", tokenBalance);

            // 상태 업데이트
            set({
                walletAddress: newAddress,
                tokenBalance: tokenBalance,  // 백엔드 응답의 tokenBalance 사용
                isLoading: false,
                error: null
            });

            return { success: true };
        } catch (error) {
            console.error("[WalletStore] 지갑 주소 업데이트 오류:", error);

            set({
                isLoading: false,
                error: error.message || "지갑 주소 업데이트 중 오류가 발생했습니다."
            });

            throw error;
        }
    },

    // 토큰 차감 함수 (투표 시 사용)
    deductToken: async (amount = 1) => {
        try {
            set({ isLoading: true, error: null });
            console.log(`[WalletStore] 토큰 차감 시작: ${amount}개`);

            const { tokenBalance } = get();

            // 토큰 잔액 확인 (클라이언트 측 검사)
            if (tokenBalance < amount) {
                console.warn("[WalletStore] 토큰 잔액 부족:", tokenBalance, "<", amount);
                throw new Error("토큰 잔액이 부족합니다.");
            }

            // 백엔드에 토큰 차감 요청
            // 참고: 이 함수는 주로 비동기 업데이트용으로 사용됨 (실제 차감은 투표 API에서 처리)
            try {
                const response = await walletAPI.deductToken(amount);

                if (!response.data.success) {
                    throw new Error(response.data.message || "토큰 차감에 실패했습니다.");
                }

                // 새 토큰 잔액 (백엔드에서 반환)
                const newBalance = response.data.data.tokenBalance || 0;
                console.log(`[WalletStore] 토큰 차감 완료 - 새 잔액: ${newBalance}`);

                // 상태 업데이트
                set({
                    tokenBalance: newBalance,  // 백엔드 응답의 tokenBalance 사용
                    isLoading: false,
                    error: null
                });

                return { success: true, balance: newBalance };
            } catch (apiError) {
                console.error("[WalletStore] 토큰 차감 API 오류:", apiError);

                // API 호출 실패 시 로컬 상태만 업데이트
                // (백엔드에서 차감되었을 가능성이 있으므로 나중에 refreshTokenBalance로 동기화 필요)
                const newBalance = Math.max(0, tokenBalance - amount);

                set({
                    tokenBalance: newBalance,
                    isLoading: false,
                    error: apiError.message || "토큰 차감 중 오류가 발생했습니다."
                });

                throw apiError;
            }
        } catch (error) {
            console.error("[WalletStore] 토큰 차감 처리 오류:", error);

            set({
                isLoading: false,
                error: error.message || "토큰 차감 중 오류가 발생했습니다."
            });

            throw error;
        }
    }
}));

export default useWalletStore;