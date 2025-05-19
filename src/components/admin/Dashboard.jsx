import React, { useState, useEffect } from 'react';
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
import { adminAPI } from '../../api/AdminApi';
import { reportAPI } from "../../api/ReportApi";

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

const AdminDashboard = () => {
    // 기간 선택 상태
    const [period, setPeriod] = useState('week');
    // 통계 데이터 상태
    const [statsData, setStatsData] = useState({
        totalUser: {
            day: [0, 0, 0, 0, 0, 0, 0],
            week: [1050, 1200, 980, 1100, 1300, 1400, 1250],
            month: [0, 0, 0, 0, 0, 0]
        },
        newUser: {
            day: [0, 0, 0, 0, 0, 0, 0],
            week: [85, 92, 78, 88, 95, 102, 90],
            month: [0, 0, 0, 0, 0, 0]
        },
        totalBoard: {
            day: [520, 580, 490, 600, 550, 630, 700],
            week: [3500, 3800, 3600, 4000, 4200, 4100, 4300],
            month: [15000, 16200, 15500, 17000, 18000, 17500]
        },
        report: {
            day: [1200, 1500, 1100, 1600, 1300, 1800, 2000],
            week: [8500, 9200, 8800, 9500, 10000, 9800, 10500],
            month: [38000, 42000, 40000, 45000, 48000, 46000]
        }
    });

    // 레이블 상태
    const [periodLabels, setPeriodLabels] = useState({
        day: ['05/13', '05/14', '05/15', '05/16', '05/17', '05/18', '05/19'],
        week: ['월', '화', '수', '목', '금', '토', '일'],
        month: ['1월', '2월', '3월', '4월', '5월', '6월']
    });

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 차트 옵션 상태 추가
    const [chartOptions, setChartOptions] = useState({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    },
                    boxWidth: window.innerWidth < 768 ? 10 : 15
                }
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                bodyFont: {
                    size: window.innerWidth < 768 ? 12 : 14
                },
                titleFont: {
                    size: window.innerWidth < 768 ? 13 : 16
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: window.innerWidth < 768 ? 45 : 0,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    },
                    autoSkip: true,
                    autoSkipPadding: window.innerWidth < 768 ? 10 : 20
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        }
    });

    // 리사이즈 이벤트에 따른 차트 옵션 업데이트
    useEffect(() => {
        const handleResize = () => {
            setChartOptions({
                ...chartOptions,
                plugins: {
                    ...chartOptions.plugins,
                    legend: {
                        ...chartOptions.plugins.legend,
                        labels: {
                            ...chartOptions.plugins.legend.labels,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            boxWidth: window.innerWidth < 768 ? 10 : 15
                        }
                    },
                    tooltip: {
                        ...chartOptions.plugins.tooltip,
                        bodyFont: {
                            size: window.innerWidth < 768 ? 12 : 14
                        },
                        titleFont: {
                            size: window.innerWidth < 768 ? 13 : 16
                        }
                    }
                },
                scales: {
                    ...chartOptions.scales,
                    x: {
                        ...chartOptions.scales.x,
                        ticks: {
                            ...chartOptions.scales.x.ticks,
                            maxRotation: window.innerWidth < 768 ? 45 : 0,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            }
                        }
                    },
                    y: {
                        ...chartOptions.scales.y,
                        ticks: {
                            ...chartOptions.scales.y.ticks,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            }
                        }
                    }
                }
            });
        };

        // 리사이즈 이벤트 리스너 추가
        window.addEventListener('resize', handleResize);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await adminAPI.getUserStats();

                console.log("Fetching report stats...");
                // 신고 데이터 가져오기
                let dailyReportData = await reportAPI.getDailyStats();
                let weeklyReportData = await reportAPI.getWeeklyStats();
                let monthlyReportData = await reportAPI.getMonthlyStats();

                console.log("Daily report data:", dailyReportData);
                console.log("Weekly report data:", weeklyReportData);
                console.log("Monthly report data:", monthlyReportData);

                // 기본 데이터 변환 체크
                dailyReportData = Array.isArray(dailyReportData) ? dailyReportData : [0, 0, 0, 0, 0, 0, 0];
                weeklyReportData = Array.isArray(weeklyReportData) ? weeklyReportData : [0, 0, 0, 0, 0, 0, 0];
                monthlyReportData = Array.isArray(monthlyReportData) ? monthlyReportData : [0, 0, 0, 0, 0, 0];

                // 현재 날짜 기준으로 동적 라벨 생성
                const currentDate = new Date();

                // 1. 일별 라벨 생성 (최근 7일)
                const dailyLabels = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(currentDate);
                    date.setDate(currentDate.getDate() - i);

                    // MM/DD 형식으로 표시
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const day = date.getDate().toString().padStart(2, '0');
                    dailyLabels.push(`${month}/${day}`);
                }

                // 2. 주간 라벨 - 요일 이름은 그대로 유지 (월, 화, 수, 목, 금, 토, 일)
                const weekLabels = ['월', '화', '수', '목', '금', '토', '일'];

                // 3. 월별 라벨 생성 (최근 6개월)
                const monthLabels = [];
                for (let i = 5; i >= 0; i--) {
                    const monthDate = new Date(currentDate);
                    monthDate.setMonth(currentDate.getMonth() - i);
                    const monthName = `${monthDate.getMonth() + 1}월`;
                    monthLabels.push(monthName);
                }

                if (response) {
                    // 응답 데이터로 상태 업데이트
                    setStatsData(prevState => ({
                        ...prevState,
                        totalUser: {
                            day: response.totalUser?.day || prevState.totalUser.day,
                            week: response.totalUser?.week || prevState.totalUser.week,
                            month: response.totalUser?.month || prevState.totalUser.month
                        },
                        newUser: {
                            day: response.newUser?.day || prevState.newUser.day,
                            week: response.newUser?.week || prevState.newUser.week,
                            month: response.newUser?.month || prevState.newUser.month
                        },
                        totalBoard: {
                            day: response.totalBoard?.day || prevState.totalBoard.day,
                            week: response.totalBoard?.week || prevState.totalBoard.week,
                            month: response.totalBoard?.month || prevState.totalBoard.month
                        },
                        report: {
                            day: dailyReportData,
                            week: weeklyReportData,
                            month: monthlyReportData
                        }
                    }));

                    // 레이블 업데이트
                    setPeriodLabels({
                        day: dailyLabels,
                        week: weekLabels,
                        month: monthLabels
                    });
                }
            } catch (error) {
                console.error('통계 데이터를 가져오는데 실패했습니다:', error);
                // 에러 표시 또는 기본 데이터 유지
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // 회원 통계 차트 데이터
    const userChartData = {
        labels: periodLabels[period],
        datasets: [
            {
                label: '전체 회원 수',
                data: statsData.totalUser[period],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.3
            },
            {
                label: '신규 회원 수',
                data: statsData.newUser[period],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            }
        ]
    };

    const boardChartData = {
        labels: periodLabels[period],
        datasets: [
            {
                label: '총 게시물 수',
                data: statsData.totalBoard[period],
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1
            }
        ]
    };

    // 신고 통계 차트 데이터
    const reportChartData = {
        labels: periodLabels[period],
        datasets: [
            {
                label: '신고 수',
                data: statsData.report[period],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1
            }
        ]
    };

    // 라인 차트에 적용할 특별 옵션
    const lineChartOptions = {
        ...chartOptions,
        elements: {
            line: {
                tension: 0.3
            },
            point: {
                radius: window.innerWidth < 768 ? 2 : 4,
                hoverRadius: window.innerWidth < 768 ? 5 : 7
            }
        }
    };

    // 바 차트에 적용할 특별 옵션
    const barChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: false
            }
        },
        barPercentage: window.innerWidth < 768 ? 0.8 : 0.9,
        categoryPercentage: window.innerWidth < 768 ? 0.8 : 0.9
    };

    // 총 가입자 수 계산 - 각 시점의 누적 값 그대로 사용
    const getTotalUsers = () => {
        const data = statsData.totalUser[period];
        // 그래프상에서는 각 시점의 누적 값을 그대로 표시
        // 통계 카드에는 가장 최근(마지막) 값만 표시
        return data.length > 0 ? data[data.length - 1] : 0;
    };

    // 신규 가입자 수 계산 - 현재 기간의 모든 값 합산
    const getNewUsers = () => {
        return statsData.newUser[period].reduce((a, b) => a + b, 0);
    };

    // 총 게시물 수 계산 함수 추가
    const getTotalPosts = () => {
        const data = statsData.totalBoard[period];
        // 총 게시물 수도 총 가입자 수와 같은 방식으로 계산
        return data.length > 0 ? data[data.length - 1] : 0;
    };

    // getReport 함수 수정
    const getReport = () => {
        const data = statsData.report[period];
        console.log("Report data for", period, ":", data); // 디버깅용

        if (!data || data.length === 0) return 0;

        // 배열인 경우 모든 값의 합계 반환
        if (Array.isArray(data)) {
            return data.reduce((sum, current) => sum + current, 0);
        } else if (typeof data === 'number') {
            return data;
        } else if (typeof data === 'object' && data !== null) {
            // 객체인 경우 count 또는 total 속성을 찾아 반환
            return data.count || data.total || 0;
        }

        return 0;
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
                    <h3>전체 회원 수</h3>
                    <div className="stat-value">
                        {loading ? '로딩 중...' : getTotalUsers()}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>신규 회원 수</h3>
                    <div className="stat-value">
                        {loading ? '로딩 중...' : getNewUsers()}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>총 게시물 수</h3>
                    <div className="stat-value">
                        {loading ? '로딩 중...' : getTotalPosts()}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>신고</h3>
                    <div className="stat-value">
                        {loading ? '로딩 중...' : getReport()}
                    </div>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="charts-container">
                <div className="chart-card wide">
                    <h2>회원 통계</h2>
                    <div className="chart-container">
                        {loading ? (
                            <div className="loading-indicator">데이터 로딩 중...</div>
                        ) : (
                            <Line
                                data={userChartData}
                                options={lineChartOptions}
                            />
                        )}
                    </div>
                </div>

                <div className="chart-row">
                    <div className="chart-card">
                        <h2>게시물 수</h2>
                        <div className="chart-container">
                            <Bar
                                data={boardChartData}
                                options={barChartOptions}
                            />
                        </div>
                    </div>
                    <div className="chart-card">
                        <h2>신고 통계</h2>
                        <div className="chart-container">
                            {loading ? (
                                <div className="loading-indicator">데이터 로딩 중...</div>
                            ) : (
                                <Bar
                                    data={reportChartData}
                                    options={barChartOptions}
                                />
                            )}
                        </div>
                    </div>
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
                    height: auto;
                    min-height: 250px;
                    max-height: 350px;
                    width: 100%;
                    position: relative;
                }

                .loading-indicator {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    font-size: 16px;
                    color: #666;
                }

                .chart-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                @media (max-width: 768px) {
                    .stats-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .chart-row {
                        grid-template-columns: 1fr;
                    }

                    .chart-container {
                        min-height: 200px;
                    }

                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .dashboard-header h1 {
                        margin-bottom: 10px;
                    }

                    .period-selector {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .period-selector button {
                        flex: 1;
                        text-align: center;
                        padding: 8px 0;
                    }
                }

                @media (max-width: 480px) {
                    .stats-cards {
                        grid-template-columns: 1fr;
                    }

                    .stat-card {
                        padding: 15px;
                    }

                    .stat-value {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;