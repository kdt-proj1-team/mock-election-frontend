import React, { useState } from 'react';
import styled from 'styled-components';
import { votingAPI } from '../../api/VotingApi';
import useWalletStore from "../../store/walletStore";

// 스타일 컴포넌트들
const VoteCard = styled.div`
    background-color: #f0f0f3;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
`;

const VoteSection = styled.div`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
`;

const PartyGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const PartyCard = styled.div`
    background-color: #f0f0f3;
    border-radius: 15px;
    padding: 20px;
    box-shadow: ${props => props.selected
            ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.7)'
            : '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7)'};
    cursor: pointer;
    transition: all 0.3s ease;
    transform: ${props => props.selected ? 'scale(0.98)' : 'scale(1)'};
    border: ${props => props.selected ? '2px solid #0073e6' : 'none'};

    &:hover {
        transform: ${props => props.selected ? 'scale(0.98)' : 'translateY(-5px)'};
    }
`;

const PartyHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
`;

const PartyName = styled.h4`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

const PartyBadge = styled.div`
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => {
        switch(props.party) {
            case '더불어민주당': return '#0072C6';
            case '국민의힘': return '#C9151E';
            case '자유통일당': return '#8000C9';
            case '개혁신당': return '#FF7920';
            case '민주노동당': return '#FFF900';
            default: return '#888888';
        }
    }};
    color: ${props => {
        switch(props.party) {
            case '민주노동당': return '#000';
            default: return '#fff';
        }
    }};
`;

const PolicyList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const PolicyItem = styled.li`
    font-size: 14px;
    color: #555;
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;
    line-height: 1.5;

    &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #888;
    }
`;

const TokenInfo = styled.div`
    display: inline-block;
    padding: 8px 15px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 500;
    background-color: #eefbf5;
    color: #16a34a;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.5);
    margin-bottom: 15px;
`;

const WalletInfo = styled.div`
    display: inline-block;
    padding: 8px 15px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 500;
    background-color: ${props => props.$isMetaMask ? '#F6E7FF' : '#EEF5FB'};
    color: ${props => props.$isMetaMask ? 'rgba(124,58,237,0.18)' : '#888888'};
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.5);
    margin-bottom: 15px;
    margin-right: 10px;
`;


const SubmitButton = styled.button`
    width: 100%;
    padding: 15px 25px;
    border: none;
    border-radius: 10px;
    background-color: #e0e0e0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
    margin-top: 30px;

    &:hover {
        background-color: #d0d0d0;
    }

    &:active {
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const NonVoterComponent = ({ election, candidates, onVoteComplete, onBackClick, tokenBalance }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { walletType } = useWalletStore();

    // 투표 처리
    const handleVote = async () => {
        if (!selectedCandidate) return;

        setSubmitting(true);
        setError(null);

        try {
            let result;

            if (walletType === "METAMASK") {
                result = await votingAPI.submitMetaMaskVoteInternal(election.sgId, selectedCandidate.id);
            } else {
                result = await votingAPI.submitVote(election.sgId, selectedCandidate.id);
            }

            if (onVoteComplete) {
                onVoteComplete(result);
            }

        } catch (error) {
            console.error('투표 처리 중 오류:', error);
            setError(error.response?.data?.message || '투표 처리 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
            setShowConfirmation(false);
        }
    };

    return (
        <VoteCard>
            <VoteSection>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <SectionTitle>정책을 선택해주세요</SectionTitle>
                    <div>
                        <WalletInfo $isMetaMask={walletType === "METAMASK"}>
                            {walletType === "METAMASK" ? "메타마스크 지갑" : "내부 지갑"}
                        </WalletInfo>
                        <TokenInfo>토큰 잔액: {tokenBalance || 0}개</TokenInfo>
                    </div>
                </div>

                <PartyGrid>
                    {candidates.map(candidate => (
                        <PartyCard
                            key={candidate.id}
                            selected={selectedCandidate?.id === candidate.id}
                            onClick={() => setSelectedCandidate(candidate)}
                        >
                            <PartyHeader>
                                <PartyName>{candidate.partyName}</PartyName>
                                <PartyBadge party={candidate.partyName}>
                                    {candidate.candidateLabel}
                                </PartyBadge>
                            </PartyHeader>
                            <PolicyList>
                                {candidate.mainPolicies?.map((policy, index) => (
                                    <PolicyItem key={index}>{policy}</PolicyItem>
                                ))}
                            </PolicyList>
                        </PartyCard>
                    ))}
                </PartyGrid>

                {error && (
                    <ErrorNotification>
                        <p>{error}</p>
                    </ErrorNotification>
                )}

                <SubmitButton
                    onClick={() => setShowConfirmation(true)}
                    disabled={!selectedCandidate || submitting}
                >
                    {submitting ? '투표 중...' : '투표하기'}
                </SubmitButton>
            </VoteSection>

            {/* 확인 모달 */}
            {showConfirmation && (
                <ModalOverlay onClick={() => setShowConfirmation(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>투표 확인</ModalTitle>
                        <ModalBody>
                            <p>다음 공약에 투표하시겠습니까?</p>
                            <SelectedPartyInfo>
                                <strong>{selectedCandidate.partyName}</strong>
                            </SelectedPartyInfo>
                        </ModalBody>
                        <ModalButtons>
                            <CancelButton onClick={() => setShowConfirmation(false)}>
                                취소
                            </CancelButton>
                            <ConfirmButton onClick={handleVote} disabled={submitting}>
                                {submitting ? '처리 중...' : '투표하기'}
                            </ConfirmButton>
                        </ModalButtons>
                    </ModalContent>
                </ModalOverlay>
            )}
        </VoteCard>
    );
};

// 확인 모달 스타일
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
    max-width: 400px;
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
    text-align: center;
`;

const SelectedPartyInfo = styled.div`
    margin-top: 15px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 10px;
    font-size: 18px;
`;

const ModalButtons = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
`;

const ModalButton = styled.button`
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
`;

const CancelButton = styled(ModalButton)`
    background-color: #e0e0e0;
    color: #333;
`;

const ConfirmButton = styled(ModalButton)`
    background-color: #5b5b5e;
    color: white;
`;

const ErrorNotification = styled.div`
    padding: 15px;
    background-color: #fff0f0;
    border-left: 4px solid #00ffa2;
    margin-bottom: 20px;
    border-radius: 4px;
`;

export default NonVoterComponent;