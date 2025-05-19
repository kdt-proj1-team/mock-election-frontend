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

const ChartSection = styled.div`
    margin-bottom: 30px;
`;

const PartyTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
`;

const ChartBar = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
`;

const ChartLabel = styled.div`
    flex: 0 0 200px;
    font-size: 14px;
    font-weight: 500;
    color: #333;

    small {
        display: block;
        color: #666;
        font-size: 12px;
    }
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
        switch (props.$party) {
            case '더불어민주당': return '#0072C6';
            case '국민의힘': return '#C9151E';
            case '자유통일당': return '#8000C9';
            case '개혁신당': return '#FF7920';
            case '민주노동당': return '#FFF900';
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
    border-left: 4px solid #255000;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #A8D5BA;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 20px auto;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const ErrorBox = styled.div`
    padding: 15px;
    background-color: #fff0f0;
    border-left: 4px solid rgba(113, 3, 145, 0.28);
    margin: 20px 0;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

// 대체 통계 생성 함수
const generateFallbackStats = (candidates) => {

    if (!Array.isArray(candidates) || candidates.length === 0) {
        return {
            votes: [],
            participation: 0,
            totalVotes: 0
        };
    }

    const allPolicies = candidates.flatMap(candidate =>
        (candidate.policies || []).map(policy => ({
            ...policy,
            candidateId: candidate.id,
            candidateLabel: candidate.candidateLabel,
            partyName: candidate.partyName
        }))
    );

    const totalVotes = 100 + Math.floor(Math.random() * 200);
    let remainingVotes = totalVotes;

    const votes = allPolicies.map((policy, index, array) => {
        if (index === array.length - 1) {
            return {
                candidateId: policy.id,
                voteCount: remainingVotes,
                percentage: parseFloat(((remainingVotes / totalVotes) * 100).toFixed(1))
            };
        }

        const minVotes = Math.max(1, Math.floor(remainingVotes * 0.1));
        const maxVotes = Math.floor(remainingVotes * 0.5);
        const voteCount = Math.floor(Math.random() * (maxVotes - minVotes)) + minVotes;

        remainingVotes -= voteCount;

        return {
            candidateId: policy.id,
            voteCount: voteCount,
            percentage: parseFloat(((voteCount / totalVotes) * 100).toFixed(1))
        };
    });

    votes.sort((a, b) => b.voteCount - a.voteCount);

    return {
        sgId: candidates[0]?.sgId || "unknown",
        votes,
        participation: parseFloat((60 + Math.random() * 30).toFixed(1))
    };
};

/**
 * 이미 투표한 사용자를 위한 컴포넌트 - 투표 결과만 표시
 */
const VoterComponent = ({ election, candidates, onBackClick }) => {
    const [voteStats, setVoteStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVoteStats = async () => {
            try {
                const statsData = await votingAPI.getVoteStats(election.sgId);
                setVoteStats(statsData);
            } catch (error) {
                // console.error('투표 통계 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVoteStats();
    }, [election.sgId]);

    const renderVoteResults = () => {
        if (!voteStats || !voteStats.votes) return null;

        // candidateId를 기준으로 후보자 찾기
        return voteStats.votes.map(vote => {
            const candidate = candidates.find(c => c.id === vote.candidateId);
            if (!candidate) return null;

            return (
                <ChartBar key={vote.candidateId}>
                    <ChartLabel>{candidate.partyName}</ChartLabel>
                    <ChartBarContainer>
                        <ChartBarFill
                            $percentage={vote.percentage}
                            $party={candidate.partyName}
                        />
                    </ChartBarContainer>
                    <ChartPercentage>{vote.percentage.toFixed(1)}%</ChartPercentage>
                </ChartBar>
            );
        });
    };

    return (
        <ResultContainer>
            <VoteCard>
                <VoteSection>
                    <SectionTitle>투표 결과</SectionTitle>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <ResultChart>
                                <ChartTitle>정당별 득표율</ChartTitle>
                                {renderVoteResults()}
                                <ParticipationInfo>
                                    투표 참여율: {voteStats?.participation?.toFixed(1) || 0}%
                                </ParticipationInfo>
                            </ResultChart>
                        </>
                    )}
                </VoteSection>
                <BackButton onClick={onBackClick}>모의투표 목록으로</BackButton>
            </VoteCard>
        </ResultContainer>
    );
};

export default VoterComponent;