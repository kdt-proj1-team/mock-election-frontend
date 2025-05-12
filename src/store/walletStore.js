// src/store/walletStore.js
import { create } from 'zustand';
import { ethers } from 'ethers';
import MetaMaskUtil from '../utils/MetaMaskUtil';
import { walletAPI } from '../api/WalletApi';
import useAuthStore from './authStore';
import VotingTokenABI from '../contracts/VotingToken.json'; // 컨트랙트 ABI 임포트

const useWalletStore = create((set, get) => {
    // 네트워크 전환 함수 정의
    const checkAndSwitchNetwork = async () => {
        try {
            set({ isLoading: true, error: null });

            // 현재 체인 ID 확인
            const chainId = await MetaMaskUtil.getChainId();
            const AMOY_CHAIN_ID = process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '0x13882';

            // Amoy 테스트넷이 아니면 전환 시도
            if (chainId !== AMOY_CHAIN_ID) {
                console.log(`[WalletStore] 현재 네트워크(${chainId})를 Amoy 테스트넷(${AMOY_CHAIN_ID})으로 전환합니다.`);

                try {
                    // 네트워크 전환 요청
                    await MetaMaskUtil.switchNetwork(AMOY_CHAIN_ID);
                    console.log("[WalletStore] Amoy 테스트넷으로 전환 성공");
                    set({ networkConnected: true });
                    return true;
                } catch (switchError) {
                    console.error("[WalletStore] 네트워크 전환 실패:", switchError);

                    // 네트워크가 존재하지 않는 경우 추가 시도
                    if (switchError.code === 4902) {
                        try {
                            await MetaMaskUtil.addAmoyNetwork();
                            console.log("[WalletStore] Amoy 테스트넷 추가 및 전환 성공");
                            set({ networkConnected: true });
                            return true;
                        } catch (addError) {
                            console.error("[WalletStore] Amoy 테스트넷 추가 실패:", addError);
                            set({
                                error: "Polygon Amoy 테스트넷을 추가할 수 없습니다. 메타마스크에서 수동으로 추가해주세요.",
                                networkConnected: false
                            });
                            return false;
                        }
                    }

                    set({
                        error: "Polygon Amoy 테스트넷으로 전환할 수 없습니다.",
                        networkConnected: false
                    });
                    return false;
                }
            } else {
                console.log("[WalletStore] 이미 Amoy 테스트넷에 연결되어 있습니다.");
                set({ networkConnected: true });
                return true;
            }
        } catch (error) {
            console.error("[WalletStore] 네트워크 확인 오류:", error);
            set({
                error: "네트워크 상태를 확인할 수 없습니다: " + error.message,
                networkConnected: false
            });
            return false;
        } finally {
            set({ isLoading: false });
        }
    };

    return {
        // 지갑 상태
        isWalletConnected: false,
        walletAddress: null,
        tokenBalance: 0,
        walletType: null, // "INTERNAL" 또는 "METAMASK"
        provider: null,
        signer: null,
        contract: null,
        isLoading: false,
        error: null,
        networkConnected: false, // Amoy 테스트넷 연결 상태

        // Amoy 테스트넷 설정
        AMOY_CHAIN_ID: process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '0x13882', // 137의 16진수 값
        AMOY_RPC_URL: process.env.REACT_APP_BLOCKCHAIN_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/Vy2XeYzATQbK82LjRfnR9WOug5RkuwjS',

        // 컨트랙트 주소 (실제 배포된 주소)
        CONTRACT_ADDRESS: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0xd9145CCE52D386f254917e481eB44e9943F39138",

        // 상태 초기화
        resetState: () => {
            set({
                isWalletConnected: false,
                walletAddress: null,
                tokenBalance: 0,
                walletType: null,
                provider: null,
                signer: null,
                contract: null,
                isLoading: false,
                error: null,
                networkConnected: false
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

        // 네트워크 확인 및 전환 함수 - 위에 정의한 함수를 여기에 할당
        checkAndSwitchNetwork,

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

                // Amoy 테스트넷 연결 확인 및 전환
                const networkConnected = await checkAndSwitchNetwork();

                if (!networkConnected) {
                    throw new Error("Polygon Amoy 테스트넷에 연결할 수 없습니다. 메타마스크 설정을 확인해주세요.");
                }

                // ethers 프로바이더 및 사이너 설정
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                // VotingToken 컨트랙트 연결
                const CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0xd9145CCE52D386f254917e481eB44e9943F39138";
                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    VotingTokenABI,
                    signer
                );

                // 백엔드에 지갑 주소 저장 요청 (메타마스크 지갑 타입으로 저장)
                const response = await walletAPI.connectMetaMaskWallet(address);

                if (!response.data.success) {
                    throw new Error(response.data.message || "지갑 연결에 실패했습니다.");
                }

                // 백엔드에서 반환한 토큰 잔액 가져오기
                const tokenBalance = response.data.data.tokenBalance || 0;
                console.log("[WalletStore] 메타마스크 지갑 연결 후 토큰 잔액:", tokenBalance);

                // 컨트랙트에서 실제 잔액 조회
                try {
                    const onchainBalance = await contract.balanceOf(address);
                    // Wei 단위를 토큰 단위로 변환 (10^18로 나눔)
                    const onchainTokenBalance = ethers.utils.formatUnits(onchainBalance, 18);
                    console.log("[WalletStore] 블록체인에서 조회한 토큰 잔액:", onchainTokenBalance);

                    // 백엔드 잔액과 블록체인 잔액이 다르면 업데이트 요청
                    const formattedBalance = parseInt(onchainTokenBalance);
                    if (formattedBalance !== tokenBalance) {
                        try {
                            await walletAPI.updateTokenBalance(formattedBalance);
                            console.log("[WalletStore] 토큰 잔액 업데이트:", formattedBalance);
                        } catch (e) {
                            console.warn("[WalletStore] 토큰 잔액 업데이트 실패:", e);
                        }
                    }
                } catch (e) {
                    console.warn("[WalletStore] 블록체인 토큰 잔액 조회 실패:", e);
                }

                // 지갑 연결 성공 후 상태 업데이트
                set({
                    isWalletConnected: true,
                    walletAddress: address,
                    tokenBalance: tokenBalance, // 백엔드 응답의 tokenBalance 사용
                    walletType: "METAMASK",
                    provider: provider,
                    signer: signer,
                    contract: contract,
                    isLoading: false,
                    error: null,
                    networkConnected: true
                });

                // 메타마스크 이벤트 리스너 등록
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        // 메타마스크에서 연결 해제된 경우
                        const store = useWalletStore.getState();
                        store.disconnectWallet();
                    } else {
                        // 계정이 변경된 경우
                        const store = useWalletStore.getState();
                        store.updateWalletAddress(accounts[0]);
                    }
                });

                // 체인 변경 이벤트 리스너
                window.ethereum.on('chainChanged', (chainId) => {
                    // 체인이 변경되면 페이지 새로고침 또는 네트워크 확인
                    const AMOY_CHAIN_ID = process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '0x13882';
                    if (chainId !== AMOY_CHAIN_ID) {
                        set({ networkConnected: false });
                        console.log("[WalletStore] 네트워크가 변경되었습니다. Amoy 테스트넷으로 다시 전환해주세요.");
                        checkAndSwitchNetwork();
                    } else {
                        set({ networkConnected: true });
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

        // 나머지 메서드들...

// 새 지갑 생성 함수 (내부 지갑)
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
                    walletType: "INTERNAL",
                    // 새로 생성된 지갑은 provider, signer 없이 읽기 전용으로 사용
                    provider: null,
                    signer: null,
                    contract: null,
                    isLoading: false,
                    error: null
                });

                return {
                    success: true,
                    address,
                    mnemonic: wallet.mnemonic,
                    tokenBalance
                };
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
                    window.ethereum.removeAllListeners('chainChanged');
                }

                // 상태 초기화
                set({
                    isWalletConnected: false,
                    walletAddress: null,
                    tokenBalance: 0,
                    walletType: null,
                    provider: null,
                    signer: null,
                    contract: null,
                    error: null,
                    isLoading: false,
                    networkConnected: false
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
                    walletType: null,
                    provider: null,
                    signer: null,
                    contract: null,
                    networkConnected: false
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
                const { isWalletConnected, walletType, contract, walletAddress } = get();
                if (!isWalletConnected) {
                    throw new Error("지갑이 연결되어 있지 않습니다.");
                }

                // 메타마스크 지갑이면 블록체인에서 잔액 조회 시도
                if (walletType === "METAMASK" && contract) {
                    try {
                        const onchainBalance = await contract.balanceOf(walletAddress);
                        // Wei 단위를 토큰 단위로 변환 (10^18로 나눔)
                        const onchainTokenBalance = parseInt(ethers.utils.formatUnits(onchainBalance, 18));
                        console.log("[WalletStore] 블록체인에서 조회한 토큰 잔액:", onchainTokenBalance);

                        // 백엔드 잔액 업데이트 (옵션)
                        try {
                            await walletAPI.updateTokenBalance(onchainTokenBalance);
                        } catch (e) {
                            console.warn("[WalletStore] 백엔드 토큰 잔액 업데이트 실패:", e);
                        }

                        // 상태 업데이트
                        set({
                            tokenBalance: onchainTokenBalance,
                            isLoading: false,
                            error: null
                        });

                        return { success: true, balance: onchainTokenBalance };
                    } catch (e) {
                        console.warn("[WalletStore] 블록체인 토큰 잔액 조회 실패, 백엔드 API 사용:", e);
                        // 실패 시 백엔드 API로 대체
                    }
                }

                // 백엔드에서 최신 토큰 잔액 가져오기
                const response = await walletAPI.getTokenBalance();

                if (!response.data.success) {
                    throw new Error(response.data.message || "토큰 잔액 조회에 실패했습니다.");
                }

                // 백엔드에서 반환한 토큰 잔액 가져오기
                const balance = response.data.data.balance || 0;
                console.log("[WalletStore] 백엔드에서 조회한 토큰 잔액:", balance);

                // 상태 업데이트
                set({
                    tokenBalance: balance,
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
                        console.log("[WalletStore] 지갑 타입:", walletData.walletType);

                        set({
                            isWalletConnected: true,
                            walletAddress: walletData.walletAddress,
                            tokenBalance: walletData.tokenBalance,
                            walletType: walletData.walletType,
                            isLoading: false
                        });

                        // 메타마스크 지갑인 경우 추가 설정
                        if (walletData.walletType === "METAMASK" && MetaMaskUtil.isMetaMaskInstalled()) {
                            try {
                                const accounts = await MetaMaskUtil.getAccounts();

                                if (accounts.length > 0 && accounts[0].toLowerCase() === walletData.walletAddress.toLowerCase()) {
                                    // 메타마스크에 연결된 계정이 있고, 저장된 지갑 주소와 일치하면 프로바이더 설정
                                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                                    const signer = provider.getSigner();

                                    // Amoy 네트워크 확인 및 전환
                                    const networkConnected = await checkAndSwitchNetwork();

                                    if (networkConnected) {
                                        // VotingToken 컨트랙트 연결
                                        const CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0xd9145CCE52D386f254917e481eB44e9943F39138";
                                        const contract = new ethers.Contract(
                                            CONTRACT_ADDRESS,
                                            VotingTokenABI,
                                            signer
                                        );

                                        set({
                                            provider,
                                            signer,
                                            contract,
                                            networkConnected: true
                                        });

                                        // 컨트랙트에서 실제 잔액 가져오기 시도
                                        try {
                                            const onchainBalance = await contract.balanceOf(walletData.walletAddress);
                                            // Wei 단위를 토큰 단위로 변환 (10^18로 나눔)
                                            const onchainTokenBalance = parseInt(ethers.utils.formatUnits(onchainBalance, 18));
                                            console.log("[WalletStore] 블록체인에서 조회한 토큰 잔액:", onchainTokenBalance);

                                            // 백엔드 잔액과 다르면 상태만 업데이트
                                            if (onchainTokenBalance !== walletData.tokenBalance) {
                                                set({ tokenBalance: onchainTokenBalance });
                                            }
                                        } catch (e) {
                                            console.warn("[WalletStore] 블록체인 토큰 잔액 조회 실패:", e);
                                        }

                                        // 메타마스크 이벤트 리스너 등록
                                        window.ethereum.on('accountsChanged', (accounts) => {
                                            if (accounts.length === 0) {
                                                const store = useWalletStore.getState();
                                                store.disconnectWallet();
                                            } else {
                                                const store = useWalletStore.getState();
                                                store.updateWalletAddress(accounts[0]);
                                            }
                                        });

                                        // 체인 변경 이벤트 리스너
                                        window.ethereum.on('chainChanged', (chainId) => {
                                            const AMOY_CHAIN_ID = process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '0x13882';
                                            if (chainId !== AMOY_CHAIN_ID) {
                                                set({ networkConnected: false });
                                                console.log("[WalletStore] 네트워크가 변경되었습니다. Amoy 테스트넷으로 다시 전환해주세요.");
                                                checkAndSwitchNetwork();
                                            } else {
                                                set({ networkConnected: true });
                                            }
                                        });
                                    }
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
                            walletType: null,
                            provider: null,
                            signer: null,
                            contract: null,
                            isLoading: false,
                            networkConnected: false
                        });
                    }

                    return {
                        success: true,
                        connected: !!walletData.connected,
                        tokenBalance: walletData.tokenBalance || 0,
                        walletType: walletData.walletType
                    };
                } else {
                    // API 응답은 성공했지만, 비즈니스 로직 실패 (success: false)
                    set({
                        isWalletConnected: false,
                        walletAddress: null,
                        tokenBalance: 0,
                        walletType: null,
                        provider: null,
                        signer: null,
                        contract: null,
                        isLoading: false,
                        error: response.data.message || "지갑 상태를 확인할 수 없습니다.",
                        networkConnected: false
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
                    walletType: null,
                    provider: null,
                    signer: null,
                    contract: null,
                    networkConnected: false
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
                    tokenBalance: tokenBalance,
                    isLoading: false,
                    error: null
                });

                // 메타마스크 지갑인 경우 컨트랙트 재설정
                const { walletType, provider } = get();
                if (walletType === "METAMASK" && provider) {
                    try {
                        const signer = provider.getSigner();
                        const CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0xd9145CCE52D386f254917e481eB44e9943F39138";
                        const contract = new ethers.Contract(
                            CONTRACT_ADDRESS,
                            VotingTokenABI,
                            signer
                        );
                        set({ signer, contract });
                    } catch (e) {
                        console.warn("[WalletStore] 컨트랙트 재설정 실패:", e);
                    }
                }

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

// 투표 트랜잭션 함수 - 메타마스크 지갑 전용
// 프론트엔드에서 블록체인 트랜잭션 직접 전송
        submitVoteTransaction: async (candidateId) => {
            try {
                set({ isLoading: true, error: null });

                const { contract, walletType, networkConnected } = get();

                // 메타마스크 지갑이 아니면 오류
                if (walletType !== "METAMASK") {
                    throw new Error("메타마스크 지갑으로만 블록체인 트랜잭션이 가능합니다.");
                }

                // Amoy 테스트넷 연결 확인
                if (!networkConnected) {
                    // 네트워크 전환 시도
                    const switched = await checkAndSwitchNetwork();
                    if (!switched) {
                        throw new Error("Polygon Amoy 테스트넷에 연결되어 있지 않습니다. 네트워크를 전환해주세요.");
                    }
                }

                // 컨트랙트가 없으면 오류
                if (!contract) {
                    throw new Error("컨트랙트 인스턴스가 초기화되지 않았습니다.");
                }

                console.log("[WalletStore] 투표 트랜잭션 실행: candidateId=", candidateId);

                // 컨트랙트 vote 함수 호출
                const tx = await contract.vote(candidateId);
                console.log("[WalletStore] 투표 트랜잭션 전송됨:", tx.hash);

                // 트랜잭션 확인 대기
                console.log("[WalletStore] 트랜잭션 확인 대기 중...");
                const receipt = await tx.wait();
                console.log("[WalletStore] 트랜잭션 확인됨:", receipt);

                // 잔액 업데이트
                await get().refreshTokenBalance();

                set({
                    isLoading: false,
                    error: null
                });

                return {
                    success: true,
                    transactionHash: tx.hash
                };
            } catch (error) {
                console.error("[WalletStore] 투표 트랜잭션 오류:", error);

                // 사용자 거부 오류 특별 처리
                if (error.code === 4001) { // MetaMask 사용자 거부 코드
                    set({
                        isLoading: false,
                        error: "사용자가 트랜잭션을 거부했습니다."
                    });
                    return {
                        success: false,
                        error: "사용자가 트랜잭션을 거부했습니다."
                    };
                }

                // 가스 부족 오류 특별 처리
                if (error.code === -32603 && error.message.includes('insufficient funds')) {
                    set({
                        isLoading: false,
                        error: "가스비가 부족합니다. Amoy 테스트넷 MATIC을 충전해주세요."
                    });
                    return {
                        success: false,
                        error: "가스비가 부족합니다. Amoy 테스트넷 MATIC을 충전해주세요."
                    };
                }

                set({
                    isLoading: false,
                    error: error.message || "투표 트랜잭션 중 오류가 발생했습니다."
                });

                return {
                    success: false,
                    error: error.message || "투표 트랜잭션 중 오류가 발생했습니다."
                };
            }
        }
    };
});

export default useWalletStore;