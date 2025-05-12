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
    color: ${props => props.$isMetaMask ? '#7C3AED' : '#2563EB'};
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.5);
    margin-bottom: 15px;
    margin-right: 10px;
`;

const CandidateList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const CandidateCard = styled.div`
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

const CandidateHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
`;

const CandidatePhoto = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #e0e0e0;
    margin-right: 15px;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8);
`;

const CandidateInfo = styled.div`
    flex: 1;
`;

const CandidateName = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 5px;
`;

const CandidateParty = styled.div`
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => {
        switch(props.party) {
            case '더불어민주당': return '#0050c8';
            case '국민의힘': return '#e61e2b';
            case '정의당': return '#ffcc00';
            case '기본소득당': return '#7f2da0';
            case '녹색당': return '#00b05d';
            default: return '#888888';
        }
    }};
    color: ${props => {
        switch(props.party) {
            case '정의당': return '#000';
            default: return '#fff';
        }
    }};
`;

const CandidateDetails = styled.div`
    margin-top: 15px;
`;

const PolicyList = styled.ul`
    padding-left: 18px;
    margin: 0;
`;

const PolicyItem = styled.li`
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
    line-height: 1.4;
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

const ErrorNotification = styled.div`
    padding: 15px;
    background-color: #fff0f0;
    border-left: 4px solid #e61e2b;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #333;
    animation: spin 1s linear infinite;
    margin-left: 10px;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

/**
 * 아직 투표하지 않은 사용자를 위한 컴포넌트 - 투표 화면 표시
 */
const NonVoterComponent = ({ election, candidates, onVoteComplete, onBackClick, tokenBalance = 0 }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 지갑 관련 상태 가져오기
    const {
        refreshTokenBalance,
        walletType,
        submitVoteTransaction
    } = useWalletStore();

    // 디버깅 로그 함수
    const logDebug = (message, data) => {
        console.log(`[NonVoterComponent] ${message}:`, data);
    };

    // 후보자 선택 핸들러
    const handleCandidateSelect = (candidateId) => {
        setSelectedCandidate(candidateId);
    };

    // 투표 제출 핸들러
    // handleSubmitVote 메소드 개선
    const handleSubmitVote = async () => {
        if (!selectedCandidate) {
            alert('후보자를 선택해주세요.');
            return;
        }

        if (submitting) {
            return; // 이미 제출 중이면 중복 제출 방지
        }

        setSubmitting(true);
        setError(null);

        try {
            // 토큰 잔액 확인 (투표 전 최종 확인)
            if (tokenBalance < 1) {
                throw new Error('투표에 필요한 토큰이 부족합니다.');
            }

            // 유효한 sgId 확인
            const sgId = election?.sgId;
            if (!sgId) {
                throw new Error('유효하지 않은 선거 ID입니다.');
            }

            logDebug('투표 제출 시작', { sgId, candidateId: selectedCandidate, walletType });

            // 지갑 타입에 따라 다른 처리
            if (walletType === "METAMASK") {
                try {
                    // 네트워크 확인
                    await refreshTokenBalance();

                    // 트랜잭션 제출 전 사용자에게 설명
                    const isConfirmed = window.confirm(
                        "메타마스크 지갑으로 투표하시면 블록체인에 트랜잭션이 기록됩니다. " +
                        "메타마스크 팝업창이 뜨면 트랜잭션을 승인해주세요. " +
                        "가스비는 Amoy 테스트넷 MATIC으로 지불됩니다."
                    );

                    if (!isConfirmed) {
                        throw new Error("사용자가 트랜잭션을 취소했습니다.");
                    }

                    // 메타마스크 투표 트랜잭션 전송 시작
                    logDebug('메타마스크 투표 트랜잭션 전송 시작');
                    const txResult = await submitVoteTransaction(selectedCandidate);

                    if (!txResult.success) {
                        throw new Error(txResult.error || '메타마스크 투표 트랜잭션에 실패했습니다.');
                    }

                    logDebug('메타마스크 투표 트랜잭션 성공', txResult);

                    // 블록체인 트랜잭션 성공 후 백엔드에 알림
                    const voteResult = await votingAPI.submitMetaMaskVote(
                        sgId,
                        selectedCandidate,
                        txResult.transactionHash
                    );

                    logDebug('메타마스크 투표 백엔드 등록 성공', voteResult);

                    // 토큰 잔액 새로고침
                    await refreshTokenBalance();

                    // 투표 완료 처리
                    onVoteComplete(voteResult);
                } catch (metaMaskError) {
                    // 상세 오류 로깅
                    console.error('메타마스크 투표 오류 상세:', metaMaskError);

                    // 사용자가 거부한 경우는 특별 처리
                    if (metaMaskError.message.includes('사용자가 트랜잭션을 거부') ||
                        metaMaskError.message.includes('User denied') ||
                        metaMaskError.code === 4001) {
                        logDebug('사용자가 메타마스크 트랜잭션을 거부함');
                        throw new Error('트랜잭션이 거부되었습니다. 투표를 완료하려면 메타마스크 트랜잭션을 승인해주세요.');
                    }

                    // 가스 부족 오류 특별 처리
                    if (metaMaskError.message.includes('insufficient funds') ||
                        (metaMaskError.code === -32603 && metaMaskError.data?.message?.includes('insufficient funds'))) {
                        throw new Error('가스비가 부족합니다. Amoy 테스트넷 MATIC을 충전해주세요.');
                    }

                    throw metaMaskError;
                }
            } else {
                // 내부 지갑은 기존 방식으로 투표
                try {
                    logDebug('내부 지갑 투표 요청 시작');
                    const voteResult = await votingAPI.submitVote(sgId, selectedCandidate);
                    logDebug('내부 지갑 투표 성공', voteResult);

                    // 토큰 잔액 새로고침
                    await refreshTokenBalance();

                    // 투표 완료 처리
                    onVoteComplete(voteResult);
                } catch (internalError) {
                    // 이미 투표한 경우 처리
                    if (internalError.response?.status === 400 &&
                        internalError.response?.data?.message?.includes('이미 투표')) {
                        logDebug('이미 투표한 사용자입니다.');
                        onVoteComplete({ success: true });
                        return;
                    }

                    // 토큰 부족 오류
                    if (internalError.response?.data?.message?.includes('토큰 잔액이 부족')) {
                        throw new Error('투표에 필요한 토큰이 부족합니다. 지갑을 확인해주세요.');
                    }

                    throw internalError;
                }
            }
        } catch (error) {
            console.error('투표 처리 중 오류 발생:', error);
            setError(error.message || '투표 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setSubmitting(false);
        }
    };

    // 지갑 타입에 따른 투표 버튼 텍스트
    const getButtonText = () => {
        if (submitting) {
            return "처리 중...";
        }

        if (walletType === "METAMASK") {
            return "메타마스크로 투표하기 (1 토큰 사용)";
        }

        return "투표하기 (1 토큰 사용)";
    };

    return (
        <>
            {error && (
                <ErrorNotification>
                    <p><strong>오류 알림:</strong> {error}</p>
                </ErrorNotification>
            )}

            <VoteCard>
                <VoteSection>
                    <SectionTitle>선거 안내</SectionTitle>
                    <p>{election?.description || '모의투표에 참여합니다.'}</p>
                    <p>각 정당의 정책만 확인하고 투표하는 블라인드 투표입니다. 정책을 잘 읽고 투표해주세요.</p>

                    <WalletInfo $isMetaMask={walletType === "METAMASK"}>
                        <span role="img" aria-label="wallet">💼</span> 연결된 지갑: {walletType === "METAMASK" ? "메타마스크" : "내부 지갑"}
                    </WalletInfo>

                    <TokenInfo>
                        <span role="img" aria-label="token">💰</span> 현재 보유 토큰: {tokenBalance} 개 (투표 시 1개 사용)
                    </TokenInfo>
                </VoteSection>

                <VoteSection>
                    <SectionTitle>후보를 선택해주세요</SectionTitle>
                    <CandidateList>
                        {candidates.map(candidate => (
                            <CandidateCard
                                key={candidate.id}
                                selected={selectedCandidate === candidate.id}
                                onClick={() => handleCandidateSelect(candidate.id)}
                            >
                                <CandidateHeader>
                                    <CandidatePhoto />
                                    <CandidateInfo>
                                        <CandidateName>{candidate.candidateLabel}</CandidateName>
                                        <CandidateParty party={candidate.partyName}>
                                            {candidate.partyName}
                                        </CandidateParty>
                                    </CandidateInfo>
                                </CandidateHeader>
                                <div>{candidate.position}</div>
                                <CandidateDetails>
                                    <h5>주요 공약</h5>
                                    <PolicyList>
                                        {candidate.mainPolicies.map((policy, index) => (
                                            <PolicyItem key={index}>{policy}</PolicyItem>
                                        ))}
                                    </PolicyList>
                                </CandidateDetails>
                            </CandidateCard>
                        ))}
                    </CandidateList>
                </VoteSection>

                <SubmitButton
                    onClick={handleSubmitVote}
                    disabled={!selectedCandidate || submitting}
                >
                    {submitting ? (
                        <>처리 중...<LoadingSpinner /></>
                    ) : (
                        getButtonText()
                    )}
                </SubmitButton>
            </VoteCard>
        </>
    );
};

export default NonVoterComponent;