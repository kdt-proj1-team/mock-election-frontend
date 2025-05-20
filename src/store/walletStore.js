// src/store/walletStore.js
import { create } from 'zustand';
import { ethers } from 'ethers';
import MetaMaskUtil from '../utils/MetaMaskUtil';
import { walletAPI } from '../api/WalletApi';
import useAuthStore from './authStore';
import VotingTokenABI from '../contracts/VotingToken.json';

const useWalletStore = create((set, get) => {
    // 네트워크 확인 및 전환
    const checkAndSwitchNetwork = async () => {
        try {
            set({ isLoading: true, error: null });

            // 현재 체인 ID 확인
            const currentChainId = await MetaMaskUtil.getChainId();

            // 환경변수에서 체인 ID 가져오기
            const expectedChainIdDecimal = process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '80002';
            const expectedChainIdHex = `0x${parseInt(expectedChainIdDecimal).toString(16)}`;

            // Amoy 테스트넷이 아니면 전환 시도
            if (currentChainId.toLowerCase() !== expectedChainIdHex.toLowerCase()) {

                try {
                    // 네트워크 전환 요청
                    await MetaMaskUtil.switchNetwork(expectedChainIdHex);
                    set({ networkConnected: true });
                    return true;
                } catch (switchError) {

                    // 네트워크가 존재하지 않는 경우 추가 시도
                    if (switchError.code === 4902) {
                        try {
                            await MetaMaskUtil.addAmoyNetwork();
                            set({ networkConnected: true });
                            return true;
                        } catch (addError) {
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
                set({ networkConnected: true });
                return true;
            }
        } catch (error) {
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
        AMOY_CHAIN_ID: process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '0x13882',
        AMOY_RPC_URL: process.env.REACT_APP_BLOCKCHAIN_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/Vy2XeYzATQbK82LjRfnR9WOug5RkuwjS',

        // 컨트랙트 주소
        CONTRACT_ADDRESS: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0x40222A186832906045f158A86f0E28D83D2f674f",

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

        // 네트워크 확인 및 전환
        checkAndSwitchNetwork,

        // 메타마스크 연결 - 간소화
        connectMetaMask: async () => {
            try {
                set({ isLoading: true, error: null });

                // 로그인 확인
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) {
                    throw new Error("로그인이 필요합니다.");
                }

                // 메타마스크 연결
                const address = await MetaMaskUtil.connectMetaMask();

                // 네트워크 확인
                const networkConnected = await checkAndSwitchNetwork();
                if (!networkConnected) {
                    throw new Error("Polygon Amoy 테스트넷에 연결할 수 없습니다.");
                }

                // 백엔드에 지갑 연결 요청
                const response = await walletAPI.connectMetaMaskWallet(address);

                if (!response.data.success) {
                    throw new Error(response.data.message || "지갑 연결 실패");
                }

                const { tokenBalance } = response.data.data;

                // ethers 설정
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
                    VotingTokenABI,
                    signer
                );

                // 상태 업데이트
                set({
                    isWalletConnected: true,
                    walletAddress: address,
                    tokenBalance: tokenBalance,
                    walletType: "METAMASK",
                    provider: provider,
                    signer: signer,
                    contract: contract,
                    networkConnected: true,
                    isLoading: false,
                    error: null
                });

                // 이벤트 리스너 등록
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        const store = useWalletStore.getState();
                        store.disconnectWallet();
                    } else {
                        const store = useWalletStore.getState();
                        store.updateWalletAddress(accounts[0]);
                    }
                });

                window.ethereum.on('chainChanged', (chainId) => {
                    const AMOY_CHAIN_ID = process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID || '0x13882';
                    if (chainId !== AMOY_CHAIN_ID) {
                        set({ networkConnected: false });
                        checkAndSwitchNetwork();
                    } else {
                        set({ networkConnected: true });
                    }
                });

                return { success: true, address, tokenBalance };

            } catch (error) {
                set({
                    isLoading: false,
                    error: error.message || "메타마스크 연결 실패"
                });
                throw error;
            }
        },

        // 새 지갑 생성 (내부 지갑)
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

                // 백엔드에서 반환한 토큰 잔액 가져오기
                const tokenBalance = response.data.data.tokenBalance || 0;

                // 지갑 생성 성공 후 상태 업데이트
                set({
                    isWalletConnected: true,
                    walletAddress: address,
                    tokenBalance: tokenBalance,
                    walletType: "INTERNAL",
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
                set({
                    isLoading: false,
                    error: error.message || "지갑 생성 중 오류가 발생했습니다."
                });
                throw error;
            }
        },

        // 지갑 연결 해제
        disconnectWallet: async () => {
            try {
                set({ isLoading: true, error: null });

                // 로그인 상태이고 지갑이 연결된 경우에만 백엔드 호출
                const { isAuthenticated } = useAuthStore.getState();
                const { isWalletConnected } = get();

                if (isAuthenticated && isWalletConnected) {
                    try {
                        await walletAPI.disconnectWallet();
                    } catch (error) {
                        console.error("[WalletStore] 지갑 연결 해제 API 호출 오류:", error);
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

        // 토큰 잔액 새로고침 - 간소화
        refreshTokenBalance: async () => {
            try {
                set({ isLoading: true, error: null });

                const { isWalletConnected } = get();
                if (!isWalletConnected) {
                    throw new Error("지갑이 연결되어 있지 않습니다.");
                }

                // 백엔드에서 토큰 잔액 조회
                const response = await walletAPI.getTokenBalance();

                if (!response.data.success) {
                    throw new Error("토큰 잔액 조회 실패");
                }

                const balance = response.data.data.balance || 0;

                set({
                    tokenBalance: balance,
                    isLoading: false,
                    error: null
                });

                return { success: true, balance };

            } catch (error) {
                set({
                    isLoading: false,
                    error: error.message
                });
                return { success: false, error: error.message };
            }
        },

        // 지갑 상태 확인 - 간소화
        checkWalletStatus: async () => {
            try {
                set({ isLoading: true, error: null });

                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) {
                    set({ isLoading: false });
                    return { success: false, message: "로그인이 필요합니다." };
                }

                const response = await walletAPI.getWalletStatus();

                if (response.data.success && response.data.data?.connected) {
                    const walletData = response.data.data;

                    set({
                        isWalletConnected: true,
                        walletAddress: walletData.walletAddress,
                        tokenBalance: walletData.tokenBalance,
                        walletType: walletData.walletType,
                        isLoading: false
                    });

                    // 메타마스크인 경우 추가 설정
                    if (walletData.walletType === "METAMASK" && MetaMaskUtil.isMetaMaskInstalled()) {
                        try {
                            const accounts = await MetaMaskUtil.getAccounts();
                            if (accounts.length > 0) {
                                await checkAndSwitchNetwork();

                                const provider = new ethers.providers.Web3Provider(window.ethereum);
                                const signer = provider.getSigner();
                                const contract = new ethers.Contract(
                                    process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
                                    VotingTokenABI,
                                    signer
                                );

                                set({ provider, signer, contract });

                                // 이벤트 리스너 등록
                                window.ethereum.on('accountsChanged', (accounts) => {
                                    if (accounts.length === 0) {
                                        const store = useWalletStore.getState();
                                        store.disconnectWallet();
                                    }
                                });

                                window.ethereum.on('chainChanged', (chainId) => {
                                    checkAndSwitchNetwork();
                                });
                            }
                        } catch (e) {
                            console.warn("[WalletStore] 메타마스크 설정 실패:", e);
                        }
                    }

                    return { success: true, connected: true };
                } else {
                    set({
                        isWalletConnected: false,
                        isLoading: false
                    });
                    return { success: true, connected: false };
                }

            } catch (error) {
                set({
                    isLoading: false,
                    error: error.message
                });
                return { success: false };
            }
        },

        // 지갑 주소 업데이트
        updateWalletAddress: async (newAddress) => {
            try {
                set({ isLoading: true, error: null });

                const response = await walletAPI.updateWallet(newAddress);

                if (!response.data.success) {
                    throw new Error("지갑 주소 업데이트 실패");
                }

                const tokenBalance = response.data.data.tokenBalance || 0;

                set({
                    walletAddress: newAddress,
                    tokenBalance: tokenBalance,
                    isLoading: false,
                    error: null
                });

                return { success: true };
            } catch (error) {
                set({
                    isLoading: false,
                    error: error.message
                });
                throw error;
            }
        },

        // walletStore.js에 추가
        hasBlockchainToken: async () => {
            try {
                const { walletAddress, contract, walletType } = get();

                if (walletType !== "METAMASK" || !contract || !walletAddress) {
                    return 0;
                }

                // 블록체인에서 실제 토큰 잔액 확인
                const balance = await contract.balanceOf(walletAddress);
                const tokenBalance = balance.div(ethers.BigNumber.from(10).pow(18)).toNumber();

                return tokenBalance;
            } catch (error) {
                return 0;
            }
        },

        // 투표 트랜잭션 전송 (메타마스크 전용)
        submitVoteTransaction: async (candidateId) => {
            try {
                set({ isLoading: true, error: null });

                const { contract, walletType, networkConnected } = get();

                if (walletType !== "METAMASK") {
                    throw new Error("메타마스크 지갑으로만 블록체인 트랜잭션이 가능합니다.");
                }

                if (!networkConnected) {
                    const switched = await checkAndSwitchNetwork();
                    if (!switched) {
                        throw new Error("Polygon Amoy 테스트넷에 연결되어 있지 않습니다.");
                    }
                }

                if (!contract) {
                    throw new Error("컨트랙트 인스턴스가 초기화되지 않았습니다.");
                }

                // 투표 트랜잭션 전송
                const tx = await contract.vote(candidateId);

                // 트랜잭션 확인 대기
                const receipt = await tx.wait();

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

                if (error.code === 4001) {
                    set({
                        isLoading: false,
                        error: "사용자가 트랜잭션을 거부했습니다."
                    });
                    return {
                        success: false,
                        error: "사용자가 트랜잭션을 거부했습니다."
                    };
                }

                if (error.code === -32603 && error.message.includes('insufficient funds')) {
                    set({
                        isLoading: false,
                        error: "가스비가 부족합니다. Amoy 테스트넷 MATIC을 충전해주세요."
                    });
                    return {
                        success: false,
                        error: "가스비가 부족합니다."
                    };
                }

                set({
                    isLoading: false,
                    error: error.message || "투표 트랜잭션 중 오류가 발생했습니다."
                });

                return {
                    success: false,
                    error: error.message
                };
            }
        }
    };
});

export default useWalletStore;