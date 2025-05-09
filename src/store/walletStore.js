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

            // ethers 프로바이더 및 사이너 설정
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // 백엔드에 지갑 주소 저장 요청
            const response = await walletAPI.connectWallet(address);

            if (!response.data.success) {
                throw new Error(response.data.message || "지갑 연결에 실패했습니다.");
            }

            const tokenBalance = response.data.data.tokenBalance || 0;

            // 지갑 연결 성공 후 상태 업데이트
            set({
                isWalletConnected: true,
                walletAddress: address,
                tokenBalance: tokenBalance,
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

            return { success: true, address };
        } catch (error) {
            console.error("메타마스크 연결 오류:", error);
            set({
                isLoading: false,
                error: error.message || "메타마스크 연결 중 오류가 발생했습니다."
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

            // 백엔드에 새 지갑 주소 저장 요청
            const response = await walletAPI.createWallet(address, privateKey);

            if (!response.data.success) {
                throw new Error(response.data.message || "지갑 생성에 실패했습니다.");
            }

            // 지급된 토큰 잔액 가져오기
            const tokenBalance = response.data.data.tokenBalance || 10; // 기본 10개 지급 가정

            // 지갑 생성 성공 후 상태 업데이트
            set({
                isWalletConnected: true,
                walletAddress: address,
                tokenBalance: tokenBalance,
                // 새로 생성된 지갑은 provider, signer 없이 읽기 전용으로 사용
                provider: null,
                signer: null,
                isLoading: false,
                error: null
            });

            return { success: true, address, mnemonic: wallet.mnemonic };
        } catch (error) {
            console.error("지갑 생성 오류:", error);
            set({
                isLoading: false,
                error: error.message || "지갑 생성 중 오류가 발생했습니다."
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
                await walletAPI.disconnectWallet();
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
            console.error("지갑 연결 해제 오류:", error);
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

    // 지갑 주소 업데이트 함수
    updateWalletAddress: async (newAddress) => {
        try {
            set({ isLoading: true, error: null });

            // 백엔드에 지갑 주소 업데이트 요청
            const response = await walletAPI.updateWallet(newAddress);

            if (!response.data.success) {
                throw new Error(response.data.message || "지갑 주소 업데이트에 실패했습니다.");
            }

            // 토큰 잔액 가져오기
            const tokenBalance = response.data.data.tokenBalance || 0;

            // 상태 업데이트
            set({
                walletAddress: newAddress,
                tokenBalance: tokenBalance,
                isLoading: false,
                error: null
            });

            return { success: true };
        } catch (error) {
            console.error("지갑 주소 업데이트 오류:", error);
            set({
                isLoading: false,
                error: error.message || "지갑 주소 업데이트 중 오류가 발생했습니다."
            });
            throw error;
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

            // 상태 업데이트
            set({
                tokenBalance: response.data.data.balance || 0,
                isLoading: false,
                error: null
            });

            return { success: true, balance: response.data.data.balance };
        } catch (error) {
            console.error("토큰 잔액 새로고침 오류:", error);
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
                return { success: false, message: "로그인이 필요합니다." };
            }

            // 로그인한 사용자의 지갑 정보 조회
            const response = await walletAPI.getWalletStatus();

            if (response.data.success && response.data.data.connected) {
                const walletData = response.data.data;

                // 기존 지갑 정보가 있으면 상태 업데이트
                set({
                    isWalletConnected: true,
                    walletAddress: walletData.walletAddress,
                    tokenBalance: walletData.tokenBalance || 0,
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
                        console.error("메타마스크 상태 확인 중 오류:", metaMaskError);
                        // 메타마스크 오류는 무시하고 진행 (지갑은 연결된 상태로 유지)
                    }
                }

                return { success: true, connected: true };
            } else {
                set({ isLoading: false, error: null });
                return { success: true, connected: false };
            }
        } catch (error) {
            console.error("지갑 상태 확인 오류:", error);
            set({
                isLoading: false,
                error: error.message || "지갑 상태 확인 중 오류가 발생했습니다."
            });
            return {
                success: false,
                message: error.message || "지갑 상태 확인 중 오류가 발생했습니다."
            };
        }
    }
}));

export default useWalletStore;