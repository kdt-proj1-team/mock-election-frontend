import { useState, useEffect } from 'react';

// 뉴스 데이터를 가져오는 커스텀 훅
export const useNewsData = () => {
  const [mainNews, setMainNews] = useState(null);
  const [sideNews, setSideNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져오는 로직이 필요합니다
    // 여기서는 예시 데이터를 사용합니다
    const fetchNews = async () => {
      try {
        // 실제 API 호출을 시뮬레이션합니다
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 메인 뉴스
        const mainNewsData = {
          date: '2025년 4월 28일',
          title: '대선 후보 첫 TV토론, 주요 쟁점은?',
          content: '어제 열린 첫 대선 후보 TV토론에서는 경제, 안보, 복지 등 다양한 이슈에 대한 치열한 논쟁이 벌어졌습니다. 이번 토론에서는 특히 청년 일자리와 주거 문제에 대한 각 후보들의 대책이...',
          imageUrl: null
        };
        
        // 사이드 뉴스
        const sideNewsData = [
          {
            id: 1,
            title: '선관위, 투표소 운영 시간 확대 검토',
            date: '2025.04.27',
            imageUrl: null
          },
          {
            id: 2,
            title: '국민 관심사 1위는 \'경제\', 2위는?',
            date: '2025.04.26',
            imageUrl: null
          },
          {
            id: 3,
            title: '20대 투표율, 역대 최고 기록 가능성',
            date: '2025.04.25',
            imageUrl: null
          }
        ];
        
        setMainNews(mainNewsData);
        setSideNews(sideNewsData);
        setIsLoading(false);
      } catch (err) {
        console.error('뉴스 데이터를 가져오는 중 오류 발생:', err);
        setError('뉴스를 불러오는 데 실패했습니다.');
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { mainNews, sideNews, isLoading, error };
};