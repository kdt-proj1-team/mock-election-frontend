import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: #f0f0f3;
    border-radius: 20px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.7);
`;

const ModalTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
`;

const ModalBody = styled.div`
    margin-bottom: 30px;
`;

const MetaMaskInfo = styled.div`
    background-color: #F6E7FF;
    border: 1px solid #7C3AED;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;
`;

const PolicyInfo = styled.div`
    background-color: #f0f8ff;
    border: 1px solid #3498db;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
`;

const ErrorBox = styled.div`
    padding: 15px;
    background-color: #fff0f0;
    border-left: 4px solid #e61e2b;
    margin: 20px 0;
    border-radius: 4px;
`;

const ModalButtons = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
`;

const Button = styled.button`
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(Button)`
    background-color: #e0e0e0;
    color: #333;

    &:hover:not(:disabled) {
        background-color: #d0d0d0;
    }
`;

const ConfirmButton = styled(Button)`
    background-color: #7C3AED;
    color: white;

    &:hover:not(:disabled) {
        background-color: #6B21A8;
    }
`;

const MetaMaskVoteModal = ({ isOpen, onClose, onConfirm, selectedPolicy, tokenBalance, isProcessing, error }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>메타마스크 투표 확인</ModalTitle>
                <ModalBody>
                    <MetaMaskInfo>
                        <p><strong>메타마스크 지갑으로 투표합니다</strong></p>
                        <p>블록체인에 트랜잭션이 기록됩니다.</p>
                        <p>토큰 잔액: {tokenBalance || 0}개</p>
                    </MetaMaskInfo>

                    {selectedPolicy && (
                        <PolicyInfo>
                            <strong>{selectedPolicy.candidateLabel} ({selectedPolicy.partyName})</strong>
                            <div>정책: {selectedPolicy.title}</div>
                        </PolicyInfo>
                    )}

                    {error && (
                        <ErrorBox>
                            <p>{error}</p>
                        </ErrorBox>
                    )}
                </ModalBody>
                <ModalButtons>
                    <CancelButton onClick={onClose} disabled={isProcessing}>
                        취소
                    </CancelButton>
                    <ConfirmButton onClick={onConfirm} disabled={isProcessing}>
                        {isProcessing ? '처리 중...' : '투표하기'}
                    </ConfirmButton>
                </ModalButtons>
            </ModalContent>
        </ModalOverlay>
    );
};

export default MetaMaskVoteModal;