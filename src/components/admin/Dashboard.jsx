import React from 'react';
import styled from 'styled-components';

const CardTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 220px;
  padding: 25px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #555;
`;

const Message = styled.p`
  font-size: 16px;
  color: #555;
  margin: 20px 0;
`;

const Dashboard = () => {
    // 샘플 통계 데이터
    const stats = {
        totalUsers: 256,
        activePosts: 128,
        pendingReports: 12,
        dailyVisits: 543
    };

    return (
        <div>
            <CardTitle>대시보드</CardTitle>
            <StatRow>
                <StatCard>
                    <StatValue>{stats.totalUsers}</StatValue>
                    <StatLabel>총 회원 수</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>{stats.activePosts}</StatValue>
                    <StatLabel>활성 게시글</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>{stats.pendingReports}</StatValue>
                    <StatLabel>미처리 신고</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>{stats.dailyVisits}</StatValue>
                    <StatLabel>오늘 방문자</StatLabel>
                </StatCard>
            </StatRow>
            <Message>샘플 데이터입니다. 실제 구현 시 API를 통해 통계 정보를 가져와야 합니다.</Message>
        </div>
    );
};

export default Dashboard;