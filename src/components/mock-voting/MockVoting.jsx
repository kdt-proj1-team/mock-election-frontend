import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import mockVotingImg from '../../assets/images/mock-voting/mock-voting-img.png';


// 뉴모피즘 스타일의 컨테이너
const PageContainer = styled.div`
    min-height: calc(100vh - 90px);
    background-color: #f0f0f3;
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
`;

const PageTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 40px;
    text-align: center;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 50px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ElectionCard = styled.div`
    background-color: #f0f0f3;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.15), -10px -10px 20px rgba(255, 255, 255, 0.8);
    }
`;

const ElectionTitle = styled.h2`
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
`;

const ElectionDate = styled.p`
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
`;

const ElectionStatus = styled.div`
    display: inline-block;
    padding: 8px 15px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 500;
    background-color: ${props => props.$active ? '#D1C4E9' : '#f5f5f5'};
    color: ${props => props.$active ? '#512DA8' : '#999'};
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.5);
`;

const ParticipationButton = styled.button`
    width: 100%;
    padding: 12px 20px;
    margin-top: 20px;
    border: none;
    border-radius: 10px;
    background-color: #e0e0e0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

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

const InfoSection = styled.section`
    background-color: #f0f0f3;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 40px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
`;

const InfoTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
`;

const InfoText = styled.p`
    font-size: 16px;
    line-height: 1.6;
    color: #555;
    margin-bottom: 15px;
`;

const LoginPrompt = styled.div`
    text-align: center;
    padding: 40px;
    background-color: #f0f0f3;
    border-radius: 20px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
`;

const LoginButton = styled.button`
    padding: 12px 25px;
    border: none;
    border-radius: 10px;
    background-color: #e0e0e0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
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

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
`;

const VotingBoothImage = styled.img`
  max-width: 100%;
  height: auto;
`;

// 샘플 선거 데이터
const sampleElections = [
    {
        id: 1,
        title: '제21대 대통령선거 모의투표',
        date: '2026년 6월 3일(화)',
        active: true,
        participated: false,
    },
    {
        id: 2,
        title: '제22대 국회의원 선거 모의투표',
        date: '2026년 4월 8일(수)',
        active: false,
        participated: false,
    },
    {
        id: 3,
        title: '제9회 전국동시지방선거 모의투표',
        date: '2026년 6월 3일 (수)',
        active: false,
        participated: false,
    }
];

const MockVoting = () => {
    const { isAuthenticated } = useAuthStore();
    const [elections, setElections] = useState(sampleElections);
    const navigate = useNavigate();

    // 로그인 페이지로 이동
    const handleLoginClick = () => {
        navigate('/login');
    };

    // 가상 투표 페이지로 이동
    const handleVoteClick = (electionId) => {
        navigate(`/mock-voting/${electionId}`);
    };

    return (
        <>
            <PageContainer>
                <ContentContainer>
                    <PageTitle>모의투표</PageTitle>

                    {isAuthenticated ? (
                        <>
                            <InfoSection>
                                <InfoTitle>모의투표란?</InfoTitle>
                                <InfoText>
                                    모의투표는 실제 선거 전에 후보자들의 공약과 정책을 비교하고 자신의 성향과 맞는 후보를 찾아볼 수 있는 서비스입니다.
                                    실제 선거와 동일한 환경에서 투표를 연습해보고, 다른 유권자들의 선택 경향도 익명으로 확인해볼 수 있습니다.
                                </InfoText>
                                <InfoText>
                                    ※ 모의투표 결과는 실제 선거와 무관하며, 투표 결과는 익명으로 통계 처리됩니다.
                                </InfoText>
                            </InfoSection>

                            <ImageContainer>
                                <VotingBoothImage src={mockVotingImg} alt="기표소 이미지" />
                            </ImageContainer>

                            <CardGrid>
                                {elections.map(election => (
                                    <ElectionCard key={election.id}>
                                        <ElectionTitle>{election.title}</ElectionTitle>
                                        <ElectionDate>{election.date}</ElectionDate>
                                        <ElectionStatus $active={election.active}>
                                            {election.active ? '참여 가능' : '준비중'}
                                        </ElectionStatus>
                                        <ParticipationButton
                                            onClick={() => handleVoteClick(election.id)}
                                            disabled={!election.active}
                                        >
                                            {election.participated ? '결과 보기' : '투표하기'}
                                        </ParticipationButton>
                                    </ElectionCard>
                                ))}
                            </CardGrid>
                        </>
                    ) : (
                        <LoginPrompt>
                            <InfoTitle>로그인이 필요한 서비스입니다</InfoTitle>
                            <InfoText>
                                모의투표에 참여하시려면 로그인이 필요합니다.
                                간편 로그인 후 다양한 선거의 모의투표에 참여해보세요.
                            </InfoText>
                            <LoginButton onClick={handleLoginClick}>
                                간편 로그인하기
                            </LoginButton>
                        </LoginPrompt>
                    )}
                </ContentContainer>
            </PageContainer>
        </>
    );
};

export default MockVoting;