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

// 스타일 컴포넌트 (동일하게 유지)
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
    const { isAuthenticated, userId } = useAuthStore();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenError, setTokenError] = useState(null);
    const [hasToken, setHasToken] = useState(true);
    const { tokenBalance, isWalletConnected, checkWalletStatus } = useWalletStore();

    // 사용자 투표 상태 관련 상태
    const [hasVoted, setHasVoted] = useState(false);
    const [checkingVoteStatus, setCheckingVoteStatus] = useState(true);
    const [showStatsAnyway, setShowStatsAnyway] = useState(false);

    // 디버깅용 로그 출력
    const logDebug = (message, data) => {
        console.log(`[DEBUG] ${message}:`, data);
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
                .then(() => console.log('선거 참여 상태 업데이트 완료'))
                .catch(err => console.error('선거 참여 상태 업데이트 실패:', err));
        } catch (error) {
            console.error('선거 참여 상태 업데이트 호출 오류:', error);
        }
    };

    // 사용자 투표 상태 확인
    const checkVoteStatus = async () => {
        if (!isAuthenticated || !election?.sgId) {
            return false;
        }

        setCheckingVoteStatus(true);
        try {
            const response = await votingAPI.checkVoteStatus(election.sgId);
            logDebug('투표 상태 확인 결과', response);
            setHasVoted(response);
            return response;
        } catch (error) {
            console.error('투표 상태 확인 중 오류:', error);
            // 에러 발생 시 API에서 사용자 정보를 직접 확인
            try {
                const userInfoResponse = await authAPI.getUserInfo();
                const userData = userInfoResponse.data.data;
                logDebug('사용자 정보로 투표 상태 확인', userData);
                const voted = userData?.isElection || false;
                setHasVoted(voted);
                return voted;
            } catch (userError) {
                console.error('사용자 정보 확인 중 오류:', userError);
                return false;
            }
        } finally {
            setCheckingVoteStatus(false);
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

                // 토큰 잔액 확인 - 토큰 잔액이 제대로 로드되었는지 확인
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
                // 투표 상태 확인 (사용자가 이미 투표했는지)
                await checkVoteStatus();

                // 정당별 정책 데이터 가져오기
                let partyPolicies = [];
                try {
                    logDebug('정당 정책 데이터 요청', basicElection.sgId);
                    const policiesResponse = await votingAPI.getPartyPoliciesByElectionId(basicElection.sgId);
                    logDebug('정당 정책 데이터 응답', policiesResponse);

                    if (Array.isArray(policiesResponse)) {
                        partyPolicies = policiesResponse;
                    } else {
                        // API 응답 구조에 따라 적절히 파싱
                        partyPolicies = Array.isArray(policiesResponse.data) ?
                            policiesResponse.data :
                            (policiesResponse.data?.data || []);
                    }

                    // 데이터 유효성 확인
                    if (!Array.isArray(partyPolicies) || partyPolicies.length === 0) {
                        throw new Error('정당 정책 데이터가 비어있습니다.');
                    }

                    logDebug('파싱된 정당 정책 데이터', partyPolicies);
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
                    logDebug('샘플 데이터 사용', partyPolicies);
                }

                // 정당별로 그룹화하기
                const groupedByParty = {};
                partyPolicies.forEach(policy => {
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

                logDebug('정당별 그룹화 결과', groupedByParty);

                // 후보자 배열 생성 (당별로 하나의 후보)
                const candidatesArray = Object.values(groupedByParty).map((party, index) => ({
                    id: index + 1,
                    candidateLabel: `후보${index + 1}`,
                    partyName: party.partyName,
                    position: `${party.partyName} 후보`,
                    mainPolicies: party.policies.slice(0, 4) // 최대 4개 정책만 표시
                }));

                logDebug('생성된 후보자 배열', candidatesArray);
                setCandidates(candidatesArray);
            } catch (error) {
                console.error('선거 데이터 로드 중 오류 발생:', error);
                setError('선거 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
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

                {/* 오류 표시 */}
                {(error || tokenError) && (
                    <ErrorNotification>
                        <p><strong>오류 알림:</strong> {error || tokenError}</p>
                    </ErrorNotification>
                )}

                {/* 디버깅 정보 (개발 중에만 사용, 최종 코드에서는 삭제) */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{margin: '20px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '12px'}}>
                        <p><strong>디버그 정보:</strong></p>
                        <p>투표 여부: {hasVoted ? '예' : '아니오'}</p>
                        <p>지갑 연결: {isWalletConnected ? '예' : '아니오'}</p>
                        <p>토큰 잔액: {tokenBalance}</p>
                        <p>토큰 있음: {hasToken ? '예' : '아니오'}</p>
                        <p>후보자 수: {candidates.length}</p>
                    </div>
                )}

                {hasVoted || showStatsAnyway ? (
                    // 이미 투표했거나 통계 보기를 선택한 경우 투표 결과 표시
                    <VoterComponent
                        election={election}
                        candidates={candidates}
                        onBackClick={handleBackToList}
                    />
                ) : !hasToken ? (
                    // 토큰이 없는 경우 안내 메시지
                    <NoTokenComponent
                        onBackClick={handleBackToList}
                        errorMessage={tokenError}
                        onShowStatsClick={() => setShowStatsAnyway(true)}
                    />
                ) : (
                    // 투표 가능한 상태: 투표 화면 표시
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