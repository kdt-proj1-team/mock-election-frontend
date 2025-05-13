import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// 스타일 컴포넌트 대신 일반 CSS 클래스로 대체
const AdminDashboard = () => {
    // 기간 선택 상태
    const [period, setPeriod] = useState('week');

    // 샘플 데이터
    const statsData = {
        visitors: {
            day: [150, 180, 210, 240, 190, 220, 280],
            week: [1050, 1200, 980, 1100, 1300, 1400, 1250],
            month: [4500, 5200, 4800, 5500, 6000, 5800]
        },
        newUsers: {
            day: [12, 15, 10, 18, 13, 20, 17],
            week: [85, 92, 78, 88, 95, 102, 90],
            month: [320, 350, 310, 380, 400, 390]
        },
        pageViews: {
            day: [520, 580, 490, 600, 550, 630, 700],
            week: [3500, 3800, 3600, 4000, 4200, 4100, 4300],
            month: [15000, 16200, 15500, 17000, 18000, 17500]
        },
        revenue: {
            day: [1200, 1500, 1100, 1600, 1300, 1800, 2000],
            week: [8500, 9200, 8800, 9500, 10000, 9800, 10500],
            month: [38000, 42000, 40000, 45000, 48000, 46000]
        }
    };

    // 기간별 레이블 설정
    const periodLabels = {
        day: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
        week: ['월', '화', '수', '목', '금', '토', '일'],
        month: ['1월', '2월', '3월', '4월', '5월', '6월']
    };

    // 방문자 통계 차트 데이터
    const visitorChartData = {
        labels: periodLabels[period],
        datasets: [
            {
                label: '방문자 수',
                data: statsData.visitors[period],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.3
            },
            {
                label: '신규 가입자',
                data: statsData.newUsers[period],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            }
        ]
    };

    // 페이지뷰 차트 데이터
    const pageViewChartData = {
        labels: periodLabels[period],
        datasets: [
            {
                label: '페이지뷰',
                data: statsData.pageViews[period],
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1
            }
        ]
    };

    // 사용자 기기 분포 도넛 차트 데이터
    const deviceChartData = {
        labels: ['데스크톱', '모바일', '태블릿'],
        datasets: [
            {
                data: [45, 40, 15],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgb(54, 162, 235)',
                    'rgb(255, 99, 132)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }
        ]
    };

    // 기본 차트 옵션
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>관리자 대시보드</h1>
                <div className="period-selector">
                    <button
                        className={period === 'day' ? 'active' : ''}
                        onClick={() => setPeriod('day')}
                    >
                        일간
                    </button>
                    <button
                        className={period === 'week' ? 'active' : ''}
                        onClick={() => setPeriod('week')}
                    >
                        주간
                    </button>
                    <button
                        className={period === 'month' ? 'active' : ''}
                        onClick={() => setPeriod('month')}
                    >
                        월간
                    </button>
                </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="stats-cards">
                <div className="stat-card">
                    <h3>총 방문자</h3>
                    <div className="stat-value">{statsData.visitors[period].reduce((a, b) => a + b, 0)}</div>
                    <div className="stat-change positive">+5.2%</div>
                </div>
                <div className="stat-card">
                    <h3>신규 가입자</h3>
                    <div className="stat-value">{statsData.newUsers[period].reduce((a, b) => a + b, 0)}</div>
                    <div className="stat-change positive">+3.8%</div>
                </div>
                <div className="stat-card">
                    <h3>페이지뷰</h3>
                    <div className="stat-value">{statsData.pageViews[period].reduce((a, b) => a + b, 0)}</div>
                    <div className="stat-change positive">+7.1%</div>
                </div>
                <div className="stat-card">
                    <h3>매출</h3>
                    <div className="stat-value">₩{statsData.revenue[period].reduce((a, b) => a + b, 0).toLocaleString()}</div>
                    <div className="stat-change positive">+4.5%</div>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="charts-container">
                <div className="chart-card wide">
                    <h2>방문자 통계</h2>
                    <div className="chart-container">
                        <Line
                            data={visitorChartData}
                            options={{
                                ...chartOptions,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-row">
                    <div className="chart-card">
                        <h2>페이지뷰</h2>
                        <div className="chart-container">
                            <Bar
                                data={pageViewChartData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="chart-card">
                        <h2>기기 사용 분포</h2>
                        <div className="chart-container">
                            <Doughnut
                                data={deviceChartData}
                                options={chartOptions}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 활동 로그 및 알림 */}
            <div className="activity-section">
                <div className="activity-card">
                    <h2>최근 활동</h2>
                    <ul className="activity-list">
                        <li>
                            <span className="activity-time">10:45</span>
                            <span className="activity-user">김철수</span>
                            <span className="activity-action">새 게시글 등록</span>
                        </li>
                        <li>
                            <span className="activity-time">10:30</span>
                            <span className="activity-user">이영희</span>
                            <span className="activity-action">회원 가입</span>
                        </li>
                        <li>
                            <span className="activity-time">10:15</span>
                            <span className="activity-user">박지민</span>
                            <span className="activity-action">결제 완료</span>
                        </li>
                        <li>
                            <span className="activity-time">09:52</span>
                            <span className="activity-user">최동욱</span>
                            <span className="activity-action">문의글 등록</span>
                        </li>
                    </ul>
                </div>

                <div className="activity-card">
                    <h2>알림</h2>
                    <ul className="notification-list">
                        <li className="notification-item urgent">
                            <div className="notification-title">미처리 신고 5건</div>
                            <div className="notification-desc">지난 24시간 동안 접수된 신고를 확인하세요.</div>
                        </li>
                        <li className="notification-item">
                            <div className="notification-title">서버 백업 완료</div>
                            <div className="notification-desc">일일 데이터 백업이 성공적으로 완료되었습니다.</div>
                        </li>
                        <li className="notification-item">
                            <div className="notification-title">시스템 업데이트 예정</div>
                            <div className="notification-desc">내일 02:00 - 04:00에 시스템 점검이 있을 예정입니다.</div>
                        </li>
                    </ul>
                </div>
            </div>

            <style jsx>{`
        .admin-dashboard {
          padding: 20px;
          background-color: #f5f7fa;
          font-family: 'Pretendard', sans-serif;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .dashboard-header h1 {
          font-size: 24px;
          margin: 0;
          color: #333;
        }
        
        .period-selector {
          display: flex;
          gap: 10px;
        }
        
        .period-selector button {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .period-selector button.active {
          background-color: #4a6cf7;
          color: white;
          border-color: #4a6cf7;
        }
        
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #666;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        
        .stat-change {
          font-size: 14px;
          font-weight: 500;
        }
        
        .stat-change.positive {
          color: #34c759;
        }
        
        .stat-change.negative {
          color: #ff3b30;
        }
        
        .charts-container {
          margin-bottom: 20px;
        }
        
        .chart-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        
        .chart-card h2 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #333;
        }
        
        .chart-card.wide {
          grid-column: span 2;
        }
        
        .chart-container {
          height: 300px;
          position: relative;
        }
        
        .chart-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .activity-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .activity-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .activity-card h2 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .activity-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .activity-list li {
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }
        
        .activity-time {
          color: #888;
          margin-right: 10px;
        }
        
        .activity-user {
          font-weight: 500;
          color: #4a6cf7;
          margin-right: 10px;
        }
        
        .notification-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .notification-item {
          padding: 12px;
          border-radius: 8px;
          background-color: #f8f9fa;
          margin-bottom: 10px;
        }
        
        .notification-item.urgent {
          background-color: #fff2f2;
          border-left: 3px solid #ff3b30;
        }
        
        .notification-title {
          font-weight: 500;
          margin-bottom: 5px;
          font-size: 15px;
        }
        
        .notification-desc {
          color: #666;
          font-size: 13px;
        }
        
        @media (max-width: 768px) {
          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .chart-row, .activity-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;