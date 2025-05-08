import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/feature/FeaturesSection';
import NewsSection from '../components/home/news/NewsSection';
import PollSection from '../components/home/poll/PollSection';
import KeywordsSection from '../components/home/keywords/KeywordsSection';
import CTASection from '../components/home/CTASection';
import YoutubeSection from "../components/home/youtube/YoutubeSection";

// 스타일 컴포넌트 정의
const PageContainer = styled.div`
  background-color: #f9f9f9;
  min-height: 100vh;
  color: #222222;
  line-height: 1.6;
`;

// 로딩 표시 컴포넌트
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
`;

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, refreshUserInfo, userInfoRefreshed } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadUserInfo = async () => {
      // 인증된 상태이고 사용자 정보가 아직 갱신되지 않았으면 정보 갱신
      if (isAuthenticated && !userInfoRefreshed) {
        try {
          await refreshUserInfo(signal);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('사용자 정보 새로고침 오류:', error);
            alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
          }
        }
      }

      setIsLoading(false);
    };

    loadUserInfo();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, userInfoRefreshed, refreshUserInfo]);

  // 로딩 중인 경우 로딩 표시
  if (isLoading) {
    return (
        <LoadingContainer>
          <p>로딩 중...</p>
        </LoadingContainer>
    );
  }

  return (
      <PageContainer>

        {/* 홈페이지 컴포넌트들은 로그인 상태와 관계없이 항상 표시됩니다 */}
        <HeroSection />
        <FeaturesSection />
        <NewsSection />
          <YoutubeSection/>
        <PollSection />
        <KeywordsSection />
        <CTASection/>
      </PageContainer>
  );
};

export default HomePage;