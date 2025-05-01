import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../../store/authStore';
import { votingAPI } from '../../api/VotingApi';
import useVotingStatus from '../../hooks/VotingStatus';
import VoterComponent from './VoterComponent';
import NonVoterComponent from './NonVoterComponent';

// 스타일 컴포넌트
const PageContainer = styled.div`
    min-height: calc(100vh - 90px);
    background-color: #f0f0f3;
`;

const ContentContainer = styled.div`
    max-width: 1500px;
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

const LoadingContainer = styled.div`
    text-align: center;
    padding: 50px;
`;

const ErrorNotification = styled.div`
    padding: 15px;
    background-color: #fff0f0;
    border-left: 4px solid #e61e2b;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

// 샘플 선거 데이터
const electionData = {
    1: {
        title: '제21대 대통령선거 모의투표',
        date: '2025년 6월 3일(화)',
        description: '대통령 선거입니다.',
        sgId: '20220309'
    }
};

const MockVotingDetail = () => {
    const { id: electionId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 투표 상태 확인 훅 사용
    const { hasVoted, loading: checkingVoteStatus, error: voteStatusError, checkVoteStatus } =
        useVotingStatus(election?.sgId);

    // 가상투표 목록으로 돌아가기
    const handleBackToList = () => {
        navigate('/mock-voting');
    };

    // 투표 완료 처리 핸들러
    const handleVoteComplete = (result) => {
        // 상태 갱신 후 투표 상태 다시 확인
        checkVoteStatus();
    };

    // 인증 확인 및 선거 정보 로드
    useEffect(() => {
        const initializeComponent = async () => {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }

            setLoading(true);

            // 기본 선거 정보 설정
            const basicElection = electionData[electionId];
            if (!basicElection) {
                setElection(null);
                setLoading(false);
                return;
            }

            setElection(basicElection);

            try {
                // API를 통해 정당별 정책 데이터 가져오기
                let partyPolicies;
                try {
                    partyPolicies = await votingAPI.getPartyPoliciesByElectionId(basicElection.sgId);
                } catch (error) {
                    console.error('정당 정책 데이터를 가져오는 중 오류 발생:', error);
                    // 오류 발생 시 샘플 데이터 사용
                    partyPolicies = [
                        { id: 1, partyName: '더불어민주당', title: '기본소득 도입', content: '전 국민 기본소득 30만원 지급' },
                        { id: 2, partyName: '더불어민주당', title: '주거 안정', content: '공공임대주택 100만호 공급' },
                        { id: 3, partyName: '국민의힘', title: '세금 감면', content: '법인세 인하로 기업 경쟁력 강화' },
                        { id: 4, partyName: '국민의힘', title: '교육 개혁', content: '대학입시 자율화' },
                        { id: 5, partyName: '정의당', title: '노동 개혁', content: '주 4일제 도입 추진' },
                        { id: 6, partyName: '정의당', title: '환경 정책', content: '2050 탄소중립 실현' }
                    ];
                }

                // 데이터 변환: 정당별로 그룹화하고 후보자 레이블 생성
                const groupedByParty = {};
                partyPolicies.forEach(policy => {
                    if (!groupedByParty[policy.partyName]) {
                        groupedByParty[policy.partyName] = {
                            partyName: policy.partyName,
                            policies: []
                        };
                    }

                    if (policy.title) {
                        groupedByParty[policy.partyName].policies.push(policy.title);
                    }
                });

                // 후보자 배열 생성 (당별로 하나의 후보)
                const candidatesArray = Object.values(groupedByParty).map((party, index) => ({
                    id: index + 1,
                    candidateLabel: `후보${index + 1}`,
                    partyName: party.partyName,
                    position: `${party.partyName} 후보`,
                    mainPolicies: party.policies.slice(0, 4) // 최대 4개 정책만 표시
                }));

                setCandidates(candidatesArray);
            } catch (error) {
                console.error('선거 데이터 로드 중 오류 발생:', error);
                setError('선거 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        initializeComponent();
    }, [isAuthenticated, navigate, electionId]);

    // 로딩 중이거나 투표 상태 확인 중인 경우
    if (loading || checkingVoteStatus) {
        return (
            <PageContainer>
                <ContentContainer>
                    <LoadingContainer>
                        <PageTitle>로딩 중...</PageTitle>
                        <p>선거 정보와 투표 상태를 확인하고 있습니다.</p>
                    </LoadingContainer>
                </ContentContainer>
            </PageContainer>
        );
    }

    // 선거 정보가 없는 경우
    if (!election) {
        return (
            <PageContainer>
                <ContentContainer>
                    <PageTitle>선거 정보를 찾을 수 없습니다</PageTitle>
                    <BreadcrumbNav>
                        <BreadcrumbLink onClick={handleBackToList}>모의투표</BreadcrumbLink>
                    </BreadcrumbNav>
                </ContentContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentContainer>
                <BreadcrumbNav>
                    <BreadcrumbLink onClick={handleBackToList}>모의투표</BreadcrumbLink>
                    <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
                    <span>{election.title}</span>
                </BreadcrumbNav>

                <PageTitle>{election.title}</PageTitle>
                <PageSubtitle>{election.date}</PageSubtitle>

                {/* 오류 표시 */}
                {(error || voteStatusError) && (
                    <ErrorNotification>
                        <p><strong>오류 알림:</strong> {error || voteStatusError}</p>
                    </ErrorNotification>
                )}

                {/* 투표 여부에 따라 다른 컴포넌트 렌더링 */}
                {hasVoted ? (
                    // 이미 투표한 사용자는 결과 화면 표시
                    <VoterComponent
                        election={election}
                        candidates={candidates}
                        onBackClick={handleBackToList}
                    />
                ) : (
                    // 투표하지 않은 사용자는 투표 화면 표시
                    <NonVoterComponent
                        election={election}
                        candidates={candidates}
                        onVoteComplete={handleVoteComplete}
                        onBackClick={handleBackToList}
                    />
                )}
            </ContentContainer>
        </PageContainer>
    );
};

export default MockVotingDetail;