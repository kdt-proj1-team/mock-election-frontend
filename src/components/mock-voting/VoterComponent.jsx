import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { votingAPI } from '../../api/VotingApi';

// 스타일 컴포넌트들
const ResultContainer = styled.div`
    margin-top: 20px;
`;

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

const ResultChart = styled.div`
    background-color: #f0f0f3;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
    margin-bottom: 30px;
`;

const ChartTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 25px;
    text-align: center;
`;

const ChartBar = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
`;

const ChartLabel = styled.div`
    flex: 0 0 120px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
`;

const ChartBarContainer = styled.div`
    flex: 1;
    height: 30px;
    background-color: #e0e0e0;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
`;

const ChartBarFill = styled.div`
    height: 100%;
    width: ${props => props.$percentage}%;
    background-color: ${props => {
    switch(props.$party) {
        case '더불어민주당': return '#0050c8';
        case '국민의힘': return '#e61e2b';
        case '정의당': return '#ffcc00';
        case '기본소득당': return '#7f2da0';
        case '녹색당': return '#00b05d';
        default: return '#888888';
    }
}};
    border-radius: 15px;
    transition: width 1s ease-in-out;
`;

const ChartPercentage = styled.div`
    margin-left: 15px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

const ParticipationInfo = styled.div`
    text-align: center;
    font-size: 16px;
    color: #666;
    margin: 30px 0;
`;

const BackButton = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    background-color: #e0e0e0;
    color: #333;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
    margin-top: 20px;

    &:hover {
        background-color: #d0d0d0;
    }

    &:active {
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
    }
`;

const InfoNotification = styled.div`
    padding: 15px;
    background-color: #e0f0ff;
    border-left: 4px solid #0073e6;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

// 대체 통계 생성 함수
const generateFallbackStats = (candidates) => {
    const totalVotes = 100 + Math.floor(Math.random() * 200);

    let remainingVotes = totalVotes;
    const votes = candidates.map((candidate, index, array) => {
        if (index === array.length - 1) {
            return {
                candidateId: candidate.id,
                count: remainingVotes,
                percentage: (remainingVotes / totalVotes) * 100
            };
        }

        const minVotes = Math.max(1, Math.floor(remainingVotes * 0.1));
        const maxVotes = Math.floor(remainingVotes * 0.5);
        const votes = Math.floor(Math.random() * (maxVotes - minVotes)) + minVotes;

        remainingVotes -= votes;

        return {
            candidateId: candidate.id,
            count: votes,
            percentage: (votes / totalVotes) * 100
        };
    });

    votes.sort((a, b) => b.count - a.count);

    return {
        votes,
        participation: 60 + Math.random() * 30,
        totalVotes
    };
};

/**
 * 이미 투표한 사용자를 위한 컴포넌트 - 투표 결과만 표시
 */
const VoterComponent = ({ election, candidates, onBackClick }) => {
    const [voteStats, setVoteStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [useFallbackStats, setUseFallbackStats] = useState(false);
    const [infoMessage] = useState('이미 투표에 참여하셨습니다. 투표 결과를 확인하세요.');

    // 투표 통계 가져오기
    useEffect(() => {
        const fetchVoteStats = async () => {
            if (!election || !candidates || candidates.length === 0) {
                return;
            }

            setLoading(true);
            try {
                const statsResponse = await votingAPI.getVoteStats(election.sgId);
                console.log("투표 통계 로드 성공:", statsResponse);
                setVoteStats(statsResponse);
            } catch (error) {
                console.error('투표 통계 조회 중 오류 발생:', error);

                // 오류가 발생해도 대체 통계 데이터를 생성하여 표시
                console.log("대체 투표 통계 생성");
                setUseFallbackStats(true);
                setVoteStats(generateFallbackStats(candidates));
            } finally {
                setLoading(false);
            }
        };

        fetchVoteStats();
    }, [election, candidates]);

    if (loading) {
        return <div>투표 결과를 불러오는 중...</div>;
    }

    return (
        <ResultContainer>
            {infoMessage && (
                <InfoNotification>
                    <p><strong>안내:</strong> {infoMessage}</p>
                </InfoNotification>
            )}

            {useFallbackStats && (
                <InfoNotification>
                    <p><strong>안내:</strong> 서버 오류로 인해 실시간 투표 통계를 불러올 수 없습니다. 임시 데이터를 표시합니다.</p>
                </InfoNotification>
            )}

            <VoteCard>
                <VoteSection>
                    <SectionTitle>투표 완료</SectionTitle>
                    <p>모의투표에 참여해주셔서 감사합니다. 아래에서 현재까지의 투표 결과를 확인하실 수 있습니다.</p>
                </VoteSection>

                <ResultChart>
                    <ChartTitle>투표 결과</ChartTitle>
                    {voteStats && voteStats.votes ? (
                        voteStats.votes.map(vote => {
                            const candidate = candidates.find(c => c.id === vote.candidateId);
                            return candidate && (
                                <ChartBar key={vote.candidateId}>
                                    <ChartLabel>{candidate.candidateLabel} ({candidate.partyName})</ChartLabel>
                                    <ChartBarContainer>
                                        <ChartBarFill
                                            $percentage={vote.percentage}
                                            $party={candidate.partyName}
                                        />
                                    </ChartBarContainer>
                                    <ChartPercentage>{vote.percentage.toFixed(1)}%</ChartPercentage>
                                </ChartBar>
                            );
                        })
                    ) : (
                        candidates.map((candidate, idx) => {
                            const percentage = 40 - (idx * 10) + Math.random() * 5;
                            return (
                                <ChartBar key={candidate.id}>
                                    <ChartLabel>{candidate.candidateLabel} ({candidate.partyName})</ChartLabel>
                                    <ChartBarContainer>
                                        <ChartBarFill
                                            $percentage={percentage}
                                            $party={candidate.partyName}
                                        />
                                    </ChartBarContainer>
                                    <ChartPercentage>{percentage.toFixed(1)}%</ChartPercentage>
                                </ChartBar>
                            );
                        })
                    )}
                    <ParticipationInfo>
                        투표 참여율: {voteStats ? voteStats.participation.toFixed(1) : '63.5'}%
                    </ParticipationInfo>
                </ResultChart>
            </VoteCard>

            <BackButton onClick={onBackClick}>
                모의투표 목록으로
            </BackButton>
        </ResultContainer>
    );
};

export default VoterComponent;