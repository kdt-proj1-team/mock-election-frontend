import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../../store/authStore';

// 뉴모피즘 스타일의 컨테이너
const PageContainer = styled.div`
    min-height: calc(100vh - 90px);
    background-color: #f0f0f3;
`;

const ContentContainer = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
`;

const PageTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
`;

const PageSubtitle = styled.h2`
    font-size: 22px;
    font-weight: 600;
    color: #444;
    margin-bottom: 20px;
    text-align: center;
`;

const BreadcrumbNav = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    font-size: 14px;
    color: #666;
`;

const BreadcrumbLink = styled.span`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`;

const BreadcrumbSeparator = styled.span`
    margin: 0 10px;
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

const ResultContainer = styled.div`
    margin-top: 40px;
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
    width: ${props => props.percentage}%;
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

// 샘플 선거 데이터
const electionData = {
    1: {
        title: '제21대 대통령선거 가상투표',
        date: '2025년 6월 3일(화)',
        description: '대통령 선거입니다.',
        candidates: [
            {
                id: 101,
                name: '김민준',
                party: '더불어민주당',
                position: '서울특별시장 후보',
                photo: null,
                mainPolicies: [
                    '서울 청년주택 10만호 공급',
                    '지하철 무료 와이파이 전면 확대',
                    '초등학교 돌봄교실 확대',
                    '미세먼지 저감을 위한 도시숲 조성'
                ]
            },
            {
                id: 102,
                name: '이서연',
                party: '국민의힘',
                position: '서울특별시장 후보',
                photo: null,
                mainPolicies: [
                    '중소기업 스마트공장 지원 확대',
                    '지역별 맞춤형 일자리 창출',
                    '야간 안전 귀가 서비스 확대',
                    '장애인 접근성 개선 사업'
                ]
            },
            {
                id: 103,
                name: '박지훈',
                party: '정의당',
                position: '서울특별시장 후보',
                photo: null,
                mainPolicies: [
                    '공공임대주택 확대',
                    '비정규직의 정규직화',
                    '생활임금 인상',
                    '지역 소상공인 지원센터 설립'
                ]
            }
        ],
        // 가상의 투표 결과 데이터
        results: {
            participation: 68.5,
            votes: [
                { candidateId: 101, percentage: 42.3 },
                { candidateId: 102, percentage: 40.1 },
                { candidateId: 103, percentage: 17.6 }
            ]
        }
    },
    2: {
        title: '제22대 국회의원 선거 가상투표',
        date: '2028년 4월 예정',
        description: '국민의 대표기관인 국회의 구성원인 국회의원을 선출하는 선거입니다.',
        candidates: [
            {
                id: 201,
                name: '최준호',
                party: '더불어민주당',
                position: '서울 강남구갑 국회의원 후보',
                photo: null,
                mainPolicies: [
                    '강남 청년창업 지원센터 설립',
                    '지역 내 문화시설 확충',
                    '교통체증 해소를 위한 대중교통 개선',
                    '노인복지센터 확대'
                ]
            },
            {
                id: 202,
                name: '정다윤',
                party: '국민의힘',
                position: '서울 강남구갑 국회의원 후보',
                photo: null,
                mainPolicies: [
                    '재건축 규제 완화',
                    '교육환경 개선 사업',
                    '지역 상권 활성화 정책',
                    '공원 및 녹지 확충'
                ]
            },
            {
                id: 203,
                name: '홍길동',
                party: '기본소득당',
                position: '서울 강남구갑 국회의원 후보',
                photo: null,
                mainPolicies: [
                    '기본소득 도입',
                    '주택가격 안정화 정책',
                    '사회적 약자를 위한 복지 확대',
                    '환경 보호 정책 강화'
                ]
            }
        ],
        // 가상의 투표 결과 데이터
        results: {
            participation: 72.1,
            votes: [
                { candidateId: 201, percentage: 39.8 },
                { candidateId: 202, percentage: 45.2 },
                { candidateId: 203, percentage: 15.0 }
            ]
        }
    },
    3: {
        title: '제8회 전국동시지방선거 가상투표',
        date: '2026년 6월 예정',
        description: '지방선거는 지방자치단체장(시장, 도지사, 군수, 구청장)과 지방의회 의원을 선출하는 선거입니다.',
        candidates: [
            {
                id: 301,
                name: '김혜진',
                party: '더불어민주당',
                position: '서울특별시장 후보',
                photo: null,
                mainPolicies: [
                    '서울 청년주택 10만호 공급',
                    '도시철도 노선 확충',
                    '초등돌봄 전면 확대',
                    '미세먼지 저감 대책 마련'
                ]
            },
            {
                id: 302,
                name: '이승우',
                party: '국민의힘',
                position: '서울특별시장 후보',
                photo: null,
                mainPolicies: [
                    '스마트시티 서울 구축',
                    '중소기업 및 자영업자 지원',
                    '공공안전 인프라 확충',
                    '도시재생 프로젝트 추진'
                ]
            },
            {
                id: 303,
                name: '조하늘',
                party: '녹색당',
                position: '서울특별시장 후보',
                photo: null,
                mainPolicies: [
                    '생태도시 서울 전환',
                    '탄소중립 서울 실현',
                    '생활폐기물 감량 및 재활용 강화',
                    '도시농업 활성화'
                ]
            }
        ],
        // 가상의 투표 결과 데이터
        results: {
            participation: 65.3,
            votes: [
                { candidateId: 301, percentage: 44.7 },
                { candidateId: 302, percentage: 38.2 },
                { candidateId: 303, percentage: 17.1 }
            ]
        }
    }
};

const MockVotingDetail = () => {
    const { id: electionId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [election, setElection] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [votingCompleted, setVotingCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 실제 API 호출 대신 샘플 데이터 사용
        const fetchElection = () => {
            setLoading(true);

            // electionId에 해당하는 선거 데이터 가져오기
            const foundElection = electionData[electionId];

            if (foundElection) {
                setElection(foundElection);
                // 개발 목적으로 가끔 투표 완료 상태를 시뮬레이션
                // 실제 구현에서는 사용자의 투표 여부를 API에서 확인
                const hasVoted = Math.random() > 0.7;
                setVotingCompleted(hasVoted);
            }

            setLoading(false);
        };

        if (isAuthenticated) {
            fetchElection();
        } else {
            navigate('/login');
        }
    }, [electionId, isAuthenticated, navigate]);

    // 후보자 선택 핸들러
    const handleCandidateSelect = (candidateId) => {
        if (!votingCompleted) {
            setSelectedCandidate(candidateId);
        }
    };

    // 투표 제출 핸들러
    const handleSubmitVote = () => {
        if (selectedCandidate) {
            // 실제 구현에서는 API 호출로 투표 제출
            console.log(`투표 제출: 선거 ID ${electionId}, 후보자 ID ${selectedCandidate}`);

            // 투표 완료 상태로 변경
            setVotingCompleted(true);
        } else {
            alert('후보자를 선택해주세요.');
        }
    };

    // 가상투표 목록으로 돌아가기
    const handleBackToList = () => {
        navigate('/mock-voting');
    };

    if (loading) {
        return (
            <>
                <PageContainer>
                    <ContentContainer>
                        <PageTitle>로딩 중...</PageTitle>
                    </ContentContainer>
                </PageContainer>
            </>
        );
    }

    if (!election) {
        return (
            <>
                <PageContainer>
                    <ContentContainer>
                        <PageTitle>선거 정보를 찾을 수 없습니다</PageTitle>
                        <BackButton onClick={handleBackToList}>가상투표 목록으로</BackButton>
                    </ContentContainer>
                </PageContainer>
            </>
        );
    }

    return (
        <>
            <PageContainer>
                <ContentContainer>
                    <BreadcrumbNav>
                        <BreadcrumbLink onClick={handleBackToList}>가상투표</BreadcrumbLink>
                        <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
                        <span>{election.title}</span>
                    </BreadcrumbNav>

                    <PageTitle>{election.title}</PageTitle>
                    <PageSubtitle>{election.date}</PageSubtitle>

                    {!votingCompleted ? (
                        // 투표 전 화면
                        <VoteCard>
                            <VoteSection>
                                <SectionTitle>선거 안내</SectionTitle>
                                <p>{election.description}</p>
                            </VoteSection>

                            <VoteSection>
                                <SectionTitle>후보자를 선택해주세요</SectionTitle>
                                <CandidateList>
                                    {election.candidates.map(candidate => (
                                        <CandidateCard
                                            key={candidate.id}
                                            selected={selectedCandidate === candidate.id}
                                            onClick={() => handleCandidateSelect(candidate.id)}
                                        >
                                            <CandidateHeader>
                                                <CandidatePhoto />
                                                <CandidateInfo>
                                                    <CandidateName>{candidate.name}</CandidateName>
                                                    <CandidateParty party={candidate.party}>
                                                        {candidate.party}
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
                                disabled={!selectedCandidate}
                            >
                                투표하기
                            </SubmitButton>
                        </VoteCard>
                    ) : (
                        // 투표 완료 후 결과 화면
                        <ResultContainer>
                            <VoteCard>
                                <VoteSection>
                                    <SectionTitle>투표 완료</SectionTitle>
                                    <p>가상투표에 참여해주셔서 감사합니다. 아래에서 현재까지의 투표 결과를 확인하실 수 있습니다.</p>
                                </VoteSection>

                                <ResultChart>
                                    <ChartTitle>투표 결과</ChartTitle>
                                    {election.results.votes.map(vote => {
                                        const candidate = election.candidates.find(c => c.id === vote.candidateId);
                                        return (
                                            <ChartBar key={vote.candidateId}>
                                                <ChartLabel>{candidate.name} ({candidate.party})</ChartLabel>
                                                <ChartBarContainer>
                                                    <ChartBarFill
                                                        percentage={vote.percentage}
                                                        party={candidate.party}
                                                    />
                                                </ChartBarContainer>
                                                <ChartPercentage>{vote.percentage}%</ChartPercentage>
                                            </ChartBar>
                                        );
                                    })}
                                    <ParticipationInfo>
                                        투표 참여율: {election.results.participation}%
                                    </ParticipationInfo>
                                </ResultChart>
                            </VoteCard>

                            <BackButton onClick={handleBackToList}>
                                가상투표 목록으로
                            </BackButton>
                        </ResultContainer>
                    )}
                </ContentContainer>
            </PageContainer>
        </>
    );
};

export default MockVotingDetail;