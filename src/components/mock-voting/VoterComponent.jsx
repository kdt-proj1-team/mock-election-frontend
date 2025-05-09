import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { votingAPI } from '../../api/VotingApi';

// 스타일 컴포넌트들 - 기존 코드 유지
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

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
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
    border-left: 4px solid #e61e2b;
    margin: 20px 0;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

// 대체 통계 생성 함수
const generateFallbackStats = (candidates) => {
    // 디버깅 로그 추가
    console.log("대체 통계 생성, 후보자 목록:", candidates);

    if (!Array.isArray(candidates) || candidates.length === 0) {
        console.warn("유효한 후보자 데이터 없음, 기본 통계 반환");
        return {
            votes: [],
            participation: 0,
            totalVotes: 0
        };
    }

    const totalVotes = 100 + Math.floor(Math.random() * 200);
    console.log("대체 통계 - 총 투표수:", totalVotes);

    let remainingVotes = totalVotes;
    const votes = candidates.map((candidate, index, array) => {
        if (index === array.length - 1) {
            return {
                candidateId: candidate.id,
                count: remainingVotes,
                voteCount: remainingVotes,
                percentage: parseFloat(((remainingVotes / totalVotes) * 100).toFixed(1))
            };
        }

        const minVotes = Math.max(1, Math.floor(remainingVotes * 0.1));
        const maxVotes = Math.floor(remainingVotes * 0.5);
        const voteCount = Math.floor(Math.random() * (maxVotes - minVotes)) + minVotes;

        remainingVotes -= voteCount;

        return {
            candidateId: candidate.id,
            count: voteCount,
            voteCount: voteCount,
            percentage: parseFloat(((voteCount / totalVotes) * 100).toFixed(1))
        };
    });

    votes.sort((a, b) => b.voteCount - a.voteCount);
    console.log("대체 통계 - 생성된 투표 데이터:", votes);

    return {
        votes,
        participation: parseFloat((60 + Math.random() * 30).toFixed(1)),
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
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState('투표 현황을 조회하고 있습니다.');

    // 디버깅 로그 함수
    const logDebug = (message, data) => {
        console.log(`[VoterComponent] ${message}:`, data);
    };

    // 투표 통계 가져오기
    useEffect(() => {
        const fetchVoteStats = async () => {
            if (!election || !candidates || candidates.length === 0) {
                setError("선거 정보 또는 후보자 정보가 없습니다.");
                setLoading(false);
                return;
            }

            logDebug("투표 통계 조회 시작", { electionId: election.sgId });
            setLoading(true);

            try {
                const response = await votingAPI.getVoteStats(election.sgId);
                logDebug("투표 통계 API 응답", response);

                // 응답 데이터 구조 확인 및 처리
                let statsData;
                if (response && response.votes) {
                    // 직접 데이터 객체인 경우
                    statsData = response;
                } else if (response && response.data && response.data.votes) {
                    // 중첩된 데이터 구조인 경우
                    statsData = response.data;
                } else if (Array.isArray(response) && response.length > 0) {
                    // 배열 형태로 반환된 경우
                    statsData = {
                        votes: response,
                        participation: 65.0, // 기본값
                        totalVotes: response.reduce((sum, vote) => sum + (vote.voteCount || 0), 0)
                    };
                } else {
                    throw new Error("투표 통계 데이터 형식이 올바르지 않습니다.");
                }

                logDebug("파싱된 투표 통계", statsData);

                // 투표 결과에 후보자 정보 매핑 확인
                const hasValidVotes = statsData.votes && statsData.votes.some(vote =>
                    candidates.some(c => c.id === vote.candidateId)
                );

                if (!hasValidVotes) {
                    logDebug("유효한 투표 데이터 없음, 대체 통계 사용");
                    setUseFallbackStats(true);
                    setVoteStats(generateFallbackStats(candidates));
                } else {
                    setVoteStats(statsData);
                }

                setInfoMessage("이미 투표에 참여하셨습니다. 투표 결과를 확인하세요.");
            } catch (error) {
                logDebug("투표 통계 조회 오류", error);
                setError("투표 통계를 불러오는 데 실패했습니다. 대체 데이터를 표시합니다.");
                setUseFallbackStats(true);
                setVoteStats(generateFallbackStats(candidates));
            } finally {
                setLoading(false);
            }
        };

        fetchVoteStats();
    }, [election, candidates]);

    if (loading) {
        return (
            <ResultContainer>
                <VoteCard>
                    <VoteSection>
                        <SectionTitle>투표 결과 로딩 중</SectionTitle>
                        <p>투표 결과를 불러오고 있습니다. 잠시만 기다려 주세요.</p>
                        <LoadingSpinner />
                    </VoteSection>
                </VoteCard>
            </ResultContainer>
        );
    }

    if (error) {
        return (
            <ResultContainer>
                <ErrorBox>
                    <p><strong>오류 발생:</strong> {error}</p>
                </ErrorBox>
                {voteStats ? (
                    <VoteCard>
                        <VoteSection>
                            <SectionTitle>대체 투표 결과</SectionTitle>
                            <p>실제 투표 결과를 불러오는 데 문제가 발생하여 임시 데이터를 표시합니다.</p>
                            <ResultChart>
                                <ChartTitle>투표 결과 (임시 데이터)</ChartTitle>
                                {renderVoteResults()}
                            </ResultChart>
                        </VoteSection>
                    </VoteCard>
                ) : (
                    <BackButton onClick={onBackClick}>
                        모의투표 목록으로
                    </BackButton>
                )}
            </ResultContainer>
        );
    }

    // 투표 결과 렌더링 함수
    const renderVoteResults = () => {
        if (!voteStats || !voteStats.votes || !Array.isArray(voteStats.votes) || voteStats.votes.length === 0) {
            return <p>투표 데이터가 없습니다.</p>;
        }

        return voteStats.votes.map(vote => {
            const candidate = candidates.find(c => c.id === vote.candidateId);
            if (!candidate) return null;

            const percentage = vote.percentage || 0;

            return (
                <ChartBar key={vote.candidateId}>
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
        });
    };

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
                    {renderVoteResults()}
                    <ParticipationInfo>
                        투표 참여율: {voteStats ? voteStats.participation?.toFixed(1) : '63.5'}%
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