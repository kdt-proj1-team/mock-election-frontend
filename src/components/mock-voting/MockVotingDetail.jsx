import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../../store/authStore';
import useWalletStore from '../../store/walletStore';
import { votingAPI } from '../../api/VotingApi';
import { authAPI } from "../../api/AuthApi";
import VoterComponent from './VoterComponent';
import NonVoterComponent from './NonVoterComponent';
import NoTokenComponent from './NoTokenComponent';

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

const InfoNotification = styled.div`
    padding: 15px;
    background-color: #f0f8ff;
    border-left: 4px solid #3498db;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 20px auto;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// 샘플 선거 데이터 (고정값)
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
    const { isAuthenticated, userId } = useAuthStore();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenError, setTokenError] = useState(null);
    const [hasToken, setHasToken] = useState(true);
    const { tokenBalance, isWalletConnected, checkWalletStatus, refreshTokenBalance } = useWalletStore();

    // 투표 상태 관련 상태
    const [hasVoted, setHasVoted] = useState(false);
    const [checkingVoteStatus, setCheckingVoteStatus] = useState(true);
    const [showStatsAnyway, setShowStatsAnyway] = useState(false);

    // 디버깅용 로그 출력
    const logDebug = (message, data) => {
        console.log(`[MockVotingDetail] ${message}:`, data);
    };

    // 가상투표 목록으로 돌아가기
    const handleBackToList = () => {
        navigate('/mock-voting');
    };

    // 투표 완료 처리 핸들러
    const handleVoteComplete = (result) => {
        logDebug('투표 완료', result);
        setHasVoted(true);

        // 전역 상태 업데이트 (authStore의 isElection 상태 업데이트)
        try {
            authAPI.updateElectionStatus(true)
                .then(() => {
                    console.log('선거 참여 상태 업데이트 완료');
                    // 토큰 잔액 새로고침 (투표 후 변경된 잔액 반영)
                    refreshTokenBalance();
                })
                .catch(err => console.error('선거 참여 상태 업데이트 실패:', err));
        } catch (error) {
            console.error('선거 참여 상태 업데이트 호출 오류:', error);
        }
    };

    // 사용자 투표 상태 확인
    const checkVoteStatus = async () => {
        if (!isAuthenticated || !election?.sgId) {
            setCheckingVoteStatus(false);
            return false;
        }

        setCheckingVoteStatus(true);
        console.log('투표 상태 확인 시작');

        try {
            // 1. 사용자 정보로 확인 (가장 확실한 방법)
            const userInfoResponse = await authAPI.getUserInfo();
            if (userInfoResponse?.data?.data?.isElection === true) {
                console.log('사용자가 이미 투표함 (사용자 정보 기준)');
                setHasVoted(true);
                setCheckingVoteStatus(false);
                return true;
            }

            // 2. 투표 API로 확인
            try {
                const voteStatus = await votingAPI.checkVoteStatus(election.sgId);
                console.log('투표 API 확인 결과:', voteStatus);
                setHasVoted(voteStatus === true);
                setCheckingVoteStatus(false);
                return voteStatus === true;
            } catch (voteError) {
                console.error('투표 API 확인 실패:', voteError);
                // 사용자 정보에서는 투표하지 않은 것으로 확인되었으므로 false 반환
                setHasVoted(false);
                setCheckingVoteStatus(false);
                return false;
            }
        } catch (error) {
            console.error('투표 상태 확인 중 오류:', error);
            setHasVoted(false);
            setCheckingVoteStatus(false);
            return false;
        }
    };

    // 지갑 및 토큰 상태 확인
    useEffect(() => {
        const checkWalletAndToken = async () => {
            if (!isAuthenticated) {
                return;
            }

            try {
                // 지갑 상태 확인 (연결 여부, 토큰 잔액)
                const walletStatus = await checkWalletStatus();
                logDebug('지갑 상태 확인 결과', walletStatus);

                // 이미 투표한 사용자라면 토큰 체크 건너뛰기
                if (hasVoted) {
                    return;
                }

                // 지갑 연결 확인
                if (!isWalletConnected) {
                    setTokenError("투표하려면 지갑 연결이 필요합니다.");
                    setHasToken(false);
                    return;
                }

                // 토큰 잔액 확인
                logDebug('현재 토큰 잔액', tokenBalance);
                if (tokenBalance < 1) {
                    setTokenError(`투표하려면 최소 1개의 토큰이 필요합니다. 현재 잔액: ${tokenBalance}개`);
                    setHasToken(false);
                    return;
                }

                setHasToken(true);
                setTokenError(null);
            } catch (error) {
                console.error('지갑 상태 확인 중 오류:', error);
                setTokenError("지갑 상태를 확인할 수 없습니다.");
                setHasToken(false);
            }
        };

        checkWalletAndToken();
    }, [isAuthenticated, hasVoted, isWalletConnected, tokenBalance, checkWalletStatus]);

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
                // 먼저 사용자 투표 상태 확인 (가장 우선)
                try {
                    // 사용자 정보 API로 투표 여부 확인 (가장 확실한 방법)
                    const userInfoResponse = await authAPI.getUserInfo();
                    const userData = userInfoResponse.data.data;

                    if (userData && userData.isElection === true) {
                        console.log('사용자가 이미 투표했음 (사용자 정보 기준)');
                        setHasVoted(true);
                    } else {
                        // 선거 ID로 투표 상태 추가 확인
                        const votingStatus = await votingAPI.checkVoteStatus(basicElection.sgId);
                        console.log('투표 API 확인 결과:', votingStatus);

                        if (votingStatus === true) {
                            console.log('사용자가 이미 투표했음 (투표 API 기준)');
                            setHasVoted(true);
                        } else {
                            setHasVoted(false);
                        }
                    }
                } catch (statusError) {
                    console.error('투표 상태 확인 중 오류:', statusError);
                    // 오류 발생 시 기본값으로 false 설정
                    setHasVoted(false);
                }

                // 정당별 정책 데이터 가져오기 (투표 여부와 관계없이 항상 로드)
                try {
                    console.log('정당 정책 데이터 요청', basicElection.sgId);
                    const policies = await votingAPI.getPartyPoliciesByElectionId(basicElection.sgId);
                    console.log('정당 정책 데이터 응답', policies);

                    // 정당별로 그룹화하기
                    if (!Array.isArray(policies) || policies.length === 0) {
                        throw new Error('정당 정책 데이터가 없습니다');
                    }

                    const groupedByParty = {};
                    policies.forEach(policy => {
                        if (!policy.partyName) return; // 정당 이름이 없는 항목은 건너뛰기

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

                    console.log('정당별 그룹화 결과', groupedByParty);

                    // 후보자 배열 생성 (당별로 하나의 후보)
                    const candidatesArray = Object.values(groupedByParty).map((party, index) => ({
                        id: index + 1,
                        candidateLabel: `후보${index + 1}`,
                        partyName: party.partyName,
                        position: `${party.partyName} 후보`,
                        mainPolicies: party.policies.slice(0, 4) // 최대 4개 정책만 표시
                    }));

                    console.log('생성된 후보자 배열', candidatesArray);
                    setCandidates(candidatesArray);
                } catch (policyError) {
                    console.error('정당 정책 데이터를 가져오는 중 오류 발생:', policyError);

                    // 오류 발생 시 샘플 데이터 사용
                    const samplePolicies = [
                        { id: 1, partyName: '더불어민주당', title: '기본소득 도입', content: '전 국민 기본소득 30만원 지급' },
                        { id: 2, partyName: '더불어민주당', title: '주거 안정', content: '공공임대주택 100만호 공급' },
                        { id: 3, partyName: '국민의힘', title: '세금 감면', content: '법인세 인하로 기업 경쟁력 강화' },
                        { id: 4, partyName: '국민의힘', title: '교육 개혁', content: '대학입시 자율화' },
                        { id: 5, partyName: '정의당', title: '노동 개혁', content: '주 4일제 도입 추진' },
                        { id: 6, partyName: '정의당', title: '환경 정책', content: '2050 탄소중립 실현' }
                    ];

                    // 정당별로 그룹화
                    const groupedByParty = {};
                    samplePolicies.forEach(policy => {
                        if (!groupedByParty[policy.partyName]) {
                            groupedByParty[policy.partyName] = {
                                partyName: policy.partyName,
                                policies: []
                            };
                        }
                        groupedByParty[policy.partyName].policies.push(policy.title);
                    });

                    // 후보자 배열 생성
                    const candidatesArray = Object.values(groupedByParty).map((party, index) => ({
                        id: index + 1,
                        candidateLabel: `후보${index + 1}`,
                        partyName: party.partyName,
                        position: `${party.partyName} 후보`,
                        mainPolicies: party.policies
                    }));

                    console.log('샘플 데이터로 생성된 후보자 배열', candidatesArray);
                    setCandidates(candidatesArray);
                }
            } catch (error) {
                console.error('선거 데이터 로드 중 오류 발생:', error);
                setError('선거 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setCheckingVoteStatus(false);
                setLoading(false);
            }
        };

        initializeComponent();
    }, [isAuthenticated, navigate, electionId, userId]);

    // 로딩 중이거나 투표 상태 확인 중인 경우
    if (loading || checkingVoteStatus) {
        return (
            <PageContainer>
                <ContentContainer>
                    <LoadingContainer>
                        <PageTitle>로딩 중...</PageTitle>
                        <p>선거 정보와 투표 상태를 확인하고 있습니다.</p>
                        <LoadingSpinner />
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

    // 후보자가 없는 경우
    if (!candidates || candidates.length === 0) {
        logDebug('후보자 데이터 없음', { candidates });
        return (
            <PageContainer>
                <ContentContainer>
                    <PageTitle>{election.title}</PageTitle>
                    <PageSubtitle>{election.date}</PageSubtitle>
                    <ErrorNotification>
                        <p><strong>오류 알림:</strong> 후보자 정보를 불러올 수 없습니다.</p>
                    </ErrorNotification>
                    <BreadcrumbNav>
                        <BreadcrumbLink onClick={handleBackToList}>모의투표 목록으로 돌아가기</BreadcrumbLink>
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

                {/* 오류 메시지 */}
                {error && (
                    <ErrorNotification>
                        <p><strong>오류:</strong> {error}</p>
                    </ErrorNotification>
                )}

                {/* 이미 투표한 사용자에게 메시지 표시 */}
                {hasVoted && (
                    <InfoNotification>
                        <p><strong>안내:</strong> 이미 투표에 참여하셨습니다. 투표 결과를 확인하실 수 있습니다.</p>
                    </InfoNotification>
                )}

                {/* 디버그 정보 */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{
                        margin: '20px 0',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        fontSize: '12px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <p><strong>디버그 정보:</strong></p>
                        <p>투표 여부: {hasVoted ? '예' : '아니오'}</p>
                        <p>지갑 연결: {isWalletConnected ? '예' : '아니오'}</p>
                        <p>토큰 잔액: {tokenBalance}</p>
                        <p>토큰 있음: {hasToken ? '예' : '아니오'}</p>
                        <p>후보자 수: {candidates.length}</p>
                    </div>
                )}

                {/* 컴포넌트 렌더링 조건 명확화 - 가장 핵심 수정 */}
                {hasVoted ? (
                    /* 이미 투표한 사용자는 무조건 결과만 볼 수 있음 */
                    <VoterComponent
                        election={election}
                        candidates={candidates}
                        onBackClick={handleBackToList}
                    />
                ) : (
                    /* 투표하지 않은 사용자는 조건에 따라 적절한 컴포넌트 표시 */
                    showStatsAnyway ? (
                        /* 통계만 보기를 선택한 경우 */
                        <VoterComponent
                            election={election}
                            candidates={candidates}
                            onBackClick={handleBackToList}
                        />
                    ) : !hasToken ? (
                        /* 토큰이 없는 경우 */
                        <NoTokenComponent
                            onBackClick={handleBackToList}
                            errorMessage={tokenError}
                            onShowStatsClick={() => setShowStatsAnyway(true)}
                        />
                    ) : (
                        /* 투표 가능한 상태 */
                        <NonVoterComponent
                            election={election}
                            candidates={candidates}
                            onVoteComplete={handleVoteComplete}
                            onBackClick={handleBackToList}
                            tokenBalance={tokenBalance}
                        />
                    )
                )}
            </ContentContainer>
        </PageContainer>
    );
};

export default MockVotingDetail;