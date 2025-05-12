import { ethers } from 'ethers';

/**
 * 메타마스크 관련 유틸리티 함수들
 */
class MetaMaskUtil {
    /**
     * 메타마스크 설치 여부 확인
     */
    static isMetaMaskInstalled() {
        return window.ethereum && window.ethereum.isMetaMask;
    }

    /**
     * 메타마스크 연결 요청
     */
    static async connectMetaMask() {

        console.log("[WalletStore] 환경 변수 확인:");
        console.log("- REACT_APP_BLOCKCHAIN_CHAIN_ID:", process.env.REACT_APP_BLOCKCHAIN_CHAIN_ID);
        console.log("- REACT_APP_BLOCKCHAIN_RPC_URL:", process.env.REACT_APP_BLOCKCHAIN_RPC_URL);
        console.log("- REACT_APP_TOKEN_CONTRACT_ADDRESS:", process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS);

        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다. 메타마스크를 설치하세요.");
        }

        try {
            // 지갑 연결 요청
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // 연결된 계정이 없으면 에러
            if (accounts.length === 0) {
                throw new Error("메타마스크 연결에 실패했습니다.");
            }

            return accounts[0]; // 연결된 첫 번째 계정 주소 반환
        } catch (error) {
            console.error("메타마스크 연결 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 메타마스크 계정 가져오기 (권한 요청 없음)
     */
    static async getAccounts() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts;
        } catch (error) {
            console.error("계정 조회 오류:", error);
            throw error;
        }
    }

    /**
     * 현재 연결된 체인 ID 가져오기
     */
    static async getChainId() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log("[MetaMaskUtil] 체인 ID 응답:", chainId);
            return chainId;
        } catch (error) {
            console.error("[MetaMaskUtil] 체인 ID 조회 오류:", error);
            throw error;
        }
    }

    static async switchNetwork(chainId) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        console.log("[MetaMaskUtil] 네트워크 전환 시도:", chainId);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
            console.log("[MetaMaskUtil] 네트워크 전환 성공");
            return true;
        } catch (error) {
            console.error("[MetaMaskUtil] 네트워크 전환 오류:", error);
            // 요청한 체인이 메타마스크에 추가되어 있지 않은 경우
            if (error.code === 4902) {
                throw new Error("해당 네트워크가 메타마스크에 추가되어 있지 않습니다. 먼저 네트워크를 추가하세요.");
            }
            throw error;
        }
    }

    static async addAmoyNetwork() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        const amoyNetworkParams = {
            chainId: '0x13882', // 80002의 16진수 값
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: ['https://polygon-amoy.g.alchemy.com/v2/Vy2XeYzATQbK82LjRfnR9WOug5RkuwjS'],
            blockExplorerUrls: ['https://amoy.polygonscan.com/']
        };

        console.log("[MetaMaskUtil] Amoy 네트워크 추가 시도:", amoyNetworkParams);

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [amoyNetworkParams],
            });
            console.log("[MetaMaskUtil] Amoy 네트워크 추가 성공");
            return true;
        } catch (error) {
            console.error("[MetaMaskUtil] Amoy 네트워크 추가 오류:", error);
            console.error("[MetaMaskUtil] 오류 코드:", error.code);
            console.error("[MetaMaskUtil] 오류 메시지:", error.message);
            throw error;
        }
    }



    /**
     * VotingToken 컨트랙트 인스턴스 생성
     */
    static getVotingTokenContract(contractAddress, abi) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            return new ethers.Contract(contractAddress, abi, signer);
        } catch (error) {
            console.error("컨트랙트 인스턴스 생성 오류:", error);
            throw error;
        }
    }

    /**
     * 메시지 서명 요청
     */
    static async signMessage(message) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error("메시지 서명 오류:", error);
            throw error;
        }
    }

    /**
     * 투표 트랜잭션 전송
     * @param {contract} contract - VotingToken 컨트랙트 인스턴스
     * @param {number} candidateId - 후보자 ID
     */
    static async sendVoteTransaction(contract, candidateId) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            // 투표 트랜잭션 전송
            const tx = await contract.vote(candidateId);

            // 트랜잭션 해시 반환
            console.log("투표 트랜잭션 전송됨:", tx.hash);

            // 트랜잭션 확인 대기 (선택 사항)
            const receipt = await tx.wait();
            console.log("트랜잭션 확인됨:", receipt);

            return {
                success: true,
                transactionHash: tx.hash,
                receipt: receipt
            };
        } catch (error) {
            console.error("투표 트랜잭션 오류:", error);

            // 사용자가 트랜잭션을 거부한 경우 특별 처리
            if (error.code === 4001) {
                throw new Error("사용자가 트랜잭션을 거부했습니다.");
            }

            throw error;
        }
    }

    /**
     * 주소 단축 표시 (0x1234...5678 형식)
     */
    static shortenAddress(address, startLength = 6, endLength = 4) {
        if (!address) return '';
        if (address.length < startLength + endLength + 3) return address;
        return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
    }

    /**
     * 새 지갑 생성
     * 주의: 이 함수는 프론트엔드에서 지갑을 생성하지만, 실제 서비스에서는 보안상의 이유로 백엔드에서 생성하는 것이 좋습니다. -> 어떻게 하라고요 ~~~아놔
     */
    static createNewWallet() {
        try {
            // 랜덤 지갑 생성
            const wallet = ethers.Wallet.createRandom();

            return {
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase
            };
        } catch (error) {
            console.error("지갑 생성 오류:", error);
            throw error;
        }
    }
}

export default MetaMaskUtil;