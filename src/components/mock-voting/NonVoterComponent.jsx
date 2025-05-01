import React, { useState } from 'react';
import styled from 'styled-components';
import { votingAPI } from '../../api/VotingApi';
import { authAPI } from '../../api/AuthApi';

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

/**
 * 아직 투표하지 않은 사용자를 위한 컴포넌트 - 투표 화면 표시
 */
const NonVoterComponent = ({ election, candidates, onVoteComplete, onBackClick }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 후보자 선택 핸들러
    const handleCandidateSelect = (candidateId) => {
        setSelectedCandidate(candidateId);
    };

    // 투표 제출 핸들러
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
            // 유효한 sgId 확인
            const sgId = election?.sgId;
            if (!sgId) {
                throw new Error('유효하지 않은 선거 ID입니다.');
            }

            console.log(`투표 제출: sgId=${sgId}, candidateId=${selectedCandidate}`);

            // 투표 제출 시도
            let voteResult;
            try {
                voteResult = await votingAPI.submitVote(sgId, selectedCandidate);
                console.log('투표 제출 성공:', voteResult);
            } catch (voteError) {
                // 서버 에러 응답 상세 로깅
                console.error('투표 제출 중 오류:', voteError);

                if (voteError.response) {
                    console.log('오류 상태 코드:', voteError.response.status);
                    console.log('오류 메시지:', voteError.response.data?.message);

                    if (voteError.response?.status === 400 &&
                        voteError.response?.data?.message?.includes('이미 투표')) {
                        console.log('이미 투표한 사용자입니다.');

                        // 중요: 여기서 투표 완료 처리를 적절히 수행해야 함
                        await authAPI.updateElectionStatus(true);

                        // 부모 컴포넌트에 통지하여 UI 업데이트
                        onVoteComplete({ success: true });
                        return;
                    }

                }

                // 다른 오류는 표시
                throw voteError;
            }

            // 사용자 투표 상태 업데이트
            try {
                await authAPI.updateElectionStatus(true);
            } catch (updateError) {
                console.error('사용자 투표 상태 업데이트 중 오류:', updateError);
                // 투표 자체는 성공했으므로 계속 진행
            }

            // 결과 화면으로 전환
            onVoteComplete(voteResult);

        } catch (error) {
            console.error('투표 처리 중 오류 발생:', error);
            setError('투표 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setSubmitting(false);
        }
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
                    <p>{election?.description}</p>
                    <p>각 정당의 정책만 확인하고 투표하는 블라인드 투표입니다. 정책을 잘 읽고 투표해주세요.</p>
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
                    {submitting ? '처리 중...' : '투표하기'}
                </SubmitButton>
            </VoteCard>
        </>
    );
};

export default NonVoterComponent;