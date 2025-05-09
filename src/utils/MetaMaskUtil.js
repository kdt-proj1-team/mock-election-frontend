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
            return chainId;
        } catch (error) {
            console.error("체인 ID 가져오기 오류:", error);
            throw error;
        }
    }

    /**
     * 네트워크 전환 요청
     * @param {string} chainId - 전환할 체인 ID (예: '0x1' for Ethereum Mainnet, '0x3' for Ropsten)
     */
    static async switchNetwork(chainId) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
            return true;
        } catch (error) {
            // 요청한 체인이 메타마스크에 추가되어 있지 않은 경우
            if (error.code === 4902) {
                throw new Error("해당 네트워크가 메타마스크에 추가되어 있지 않습니다. 먼저 네트워크를 추가하세요.");
            }
            console.error("네트워크 전환 오류:", error);
            throw error;
        }
    }

    /**
     * 새 네트워크 추가 요청
     */
    static async addNetwork(networkParams) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkParams],
            });
            return true;
        } catch (error) {
            console.error("네트워크 추가 오류:", error);
            throw error;
        }
    }

    /**
     * 새 지갑 생성
     * 주의: 이 함수는 프론트엔드에서 지갑을 생성하지만, 실제 서비스에서는 보안상의 이유로 백엔드에서 생성하는 것이 좋습니다.
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

    /**
     * ERC-20 토큰 추가 요청
     */
    static async addToken(tokenParams) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: tokenParams,
                },
            });
            return true;
        } catch (error) {
            console.error("토큰 추가 오류:", error);
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
     * 트랜잭션 전송
     */
    static async sendTransaction(transaction) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error("메타마스크가 설치되어 있지 않습니다.");
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const tx = await signer.sendTransaction(transaction);
            return tx;
        } catch (error) {
            console.error("트랜잭션 전송 오류:", error);
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
}

export default MetaMaskUtil;