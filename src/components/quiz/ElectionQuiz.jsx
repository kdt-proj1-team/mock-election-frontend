import React, { useState, useEffect } from 'react';
import './ElectionQuiz.css';
import quizAPI from '../../api/QuizApi'; // 분리된 API 임포트
import axios from 'axios';
import PageTranslator from '../translation/PageTranslator';

// 기존 CSS 파일에 추가할 스타일을 위한 인라인 스타일 객체
const customStyles = {
    correct: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
        color: '#2e7d32'
    },
    incorrect: {
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
        color: '#c62828'
    },
    userSelected: {
        borderWidth: '2px',
        borderStyle: 'solid',
        position: 'relative'
    },
    correctLabel: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#4caf50',
        color: 'white'
    },
    yourChoiceLabel: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#ff9800',
        color: 'white'
    }
};

const ElectionQuiz = () => {
    const [quizData, setQuizData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizMode, setQuizMode] = useState('sequential'); // 'sequential' 또는 'random'
    const [allCompleted, setAllCompleted] = useState(false);
    const [totalQuizCount, setTotalQuizCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    // 완료 현황 업데이트 - async/await 패턴 적용
    const updateCompletionStatus = async () => {
        try {
            // 모든 퀴즈 ID와 완료된 퀴즈 ID 가져오기
            const allQuizIds = await quizAPI.fetchAllQuizIds();
            const completedQuizzes = quizAPI.getCompletedQuizzes();

            // 완료 상태 정보 로깅
            console.log('완료 상태 정보:', {
                총퀴즈수: allQuizIds.length,
                완료된퀴즈수: completedQuizzes.length,
                완료된퀴즈목록: completedQuizzes
            });

            // 상태 업데이트
            setTotalQuizCount(allQuizIds.length);
            setCompletedCount(completedQuizzes.length);

            // 모든 퀴즈가 완료되었는지 확인 (퀴즈가 최소 1개 이상 있을 때만)
            const isAllCompleted = allQuizIds.length > 0 &&
                allQuizIds.every(id => completedQuizzes.includes(id));
            setAllCompleted(isAllCompleted);

            return { allQuizIds, completedQuizzes, isAllCompleted };
        } catch (err) {
            console.error('완료 상태 확인 중 오류 발생:', err);
            return null;
        }
    };

    // 컴포넌트 마운트시 초기화 및 데이터 로드
    useEffect(() => {
        // 컴포넌트 마운트 시 로컬 스토리지 초기화 (이전 상태 리셋)
        resetCompletedQuizzesAndSession();

        // 퀴즈 초기화 및 로드
        const initQuiz = async () => {
            if (quizMode === 'sequential') {
                await fetchFirstQuiz();
            } else {
                await fetchRandomQuiz();
            }

            // 진행 상태 업데이트 (초기화된 상태)
            await updateCompletionStatus();
        };

        initQuiz();

        // 페이지 이탈 시 세션 및 로컬 스토리지 초기화
        const handleBeforeUnload = () => {
            resetCompletedQuizzesAndSession();
        };

        // 브라우저 창 닫기 또는 페이지 이동 시 이벤트 리스너 추가
        window.addEventListener('beforeunload', handleBeforeUnload);

        // 클린업 함수
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // 페이지 언마운트 시에도 초기화
            resetCompletedQuizzesAndSession();
        };
    }, [quizMode]);

    // 완료된 퀴즈 및 세션 상태 초기화 함수
    const resetCompletedQuizzesAndSession = () => {
        console.log('퀴즈 진행 상태 및 세션 초기화');
        // localStorage에서 완료된 퀴즈 정보 삭제
        quizAPI.resetCompletedQuizzes();
        // 퀴즈 상태 정보 삭제
        localStorage.removeItem('quizState');
    };

    const fetchFirstQuiz = async () => {
        setLoading(true);
        setShowAnswer(false);
        setSelectedOption(null);

        try {
            const quiz = await quizAPI.fetchFirstQuiz();
            setQuizData(quiz);
            setError(null);
        } catch (err) {
            console.error('Error fetching first quiz:', err);
            setError('퀴즈를 불러오는 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRandomQuiz = async () => {
        setLoading(true);
        setShowAnswer(false);
        setSelectedOption(null);

        try {
            const quiz = await quizAPI.fetchRandomQuiz();
            setQuizData(quiz);
            setError(null);
        } catch (err) {
            console.error('Error fetching random quiz:', err);
            setError('랜덤 퀴즈를 불러오는 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNextQuiz = async () => {
        if (!quizData || !quizData.id) return;

        setLoading(true);
        setShowAnswer(false);
        setSelectedOption(null);

        try {
            const quiz = await quizAPI.fetchNextQuiz(quizData.id);
            setQuizData(quiz);
            setError(null);
        } catch (err) {
            console.error('Error fetching next quiz:', err);
            setError('다음 퀴즈를 불러오는 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreviousQuiz = async () => {
        if (!quizData || !quizData.id) return;

        setLoading(true);
        setShowAnswer(false);
        setSelectedOption(null);

        try {
            const quiz = await quizAPI.fetchPreviousQuiz(quizData.id);
            setQuizData(quiz);
            setError(null);
        } catch (err) {
            console.error('Error fetching previous quiz:', err);
            setError('이전 퀴즈를 불러오는 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionNumber) => {
        setSelectedOption(optionNumber);
    };

    const handleSubmit = () => {
        if (selectedOption) {
            setShowAnswer(true);
        }
    };

    const handleNextQuiz = async () => {
        // 정답을 확인한 후에만 완료 처리
        if (showAnswer && quizData && quizData.id) {
            // 아직 완료되지 않은 퀴즈인 경우에만 저장
            if (!quizAPI.isQuizCompleted(quizData.id)) {
                console.log(`퀴즈 ID ${quizData.id} 완료 처리 시작`);
                quizAPI.saveCompletedQuiz(quizData.id);

                // 완료 후 상태 업데이트 - await로 비동기 작업 완료 대기
                const result = await updateCompletionStatus();
                console.log('완료 상태 업데이트 완료:', result);
            } else {
                console.log(`퀴즈 ID ${quizData.id}는 이미 완료됨`);
            }
        }

        if (quizMode === 'sequential') {
            await fetchNextQuiz();
        } else {
            await fetchRandomQuiz();
        }
    };

    const resetQuizzes = async () => {
        console.log('퀴즈 진행 상태 초기화 시작');
        resetCompletedQuizzesAndSession();

        // 리셋 후 상태 업데이트
        await updateCompletionStatus();
        console.log('퀴즈 진행 상태 초기화 완료');

        if (quizMode === 'sequential') {
            await fetchFirstQuiz();
        } else {
            await fetchRandomQuiz();
        }
    };

    const toggleQuizMode = () => {
        setQuizMode(prevMode => {
            const newMode = prevMode === 'sequential' ? 'random' : 'sequential';
            console.log(`퀴즈 모드 변경: ${prevMode} -> ${newMode}`);
            return newMode;
        });
    };

    // 정답과 사용자 선택에 따른 스타일 계산 헬퍼 함수
    const getOptionStyle = (optionNumber) => {
        if (!showAnswer) {
            return {};
        }

        const isCorrect = quizData?.correctAnswer === optionNumber;
        const isUserSelected = selectedOption === optionNumber;

        let style = {};

        // 기본 스타일 적용
        if (isCorrect) {
            style = {...style, ...customStyles.correct};
        } else if (isUserSelected) {
            style = {...style, ...customStyles.incorrect};
        }

        // 선택 강조 테두리 스타일 적용
        if (isUserSelected || isCorrect) {
            style = {...style, ...customStyles.userSelected};
        }

        return style;
    };

    // 로딩 상태 렌더링
    if (loading) {
        return (
            <div className="quiz-container">
                <div className="quiz-content">
                    <div className="quiz-main">
                        <h1 className="quiz-title">선거 정보 퀴즈!</h1>
                        <p className="loading-text">퀴즈를 불러오는 중입니다...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 오류 상태 렌더링
    if (error) {
        return (
            <div className="quiz-container">
                <div className="quiz-content">
                    <div className="quiz-main">
                        <h1 className="quiz-title">선거 정보 퀴즈!</h1>
                        <p className="error-text">{error}</p>
                        <button className="button" onClick={quizMode === 'sequential' ? fetchFirstQuiz : fetchRandomQuiz}>다시 시도</button>
                    </div>
                </div>
            </div>
        );
    }

    // 모든 퀴즈 완료 화면 렌더링
    if (allCompleted && quizMode === 'sequential') {
        return (
            <div className="quiz-container">
                <div className="quiz-content">
                    <div className="quiz-main completion-screen">
                        <h1 className="quiz-title">축하합니다!</h1>
                        <div className="completion-message">
                            <p>모든 퀴즈를 다 풀었습니다.</p>
                            <p>수고하셨습니다! 🎉</p>
                            <p className="completion-stats">총 {totalQuizCount}개의 퀴즈를 완료했습니다.</p>
                        </div>
                        <div className="completion-buttons">
                            <button className="button secondary-button" onClick={resetQuizzes}>
                                처음부터 다시 시작하기
                            </button>
                            <button className="button primary-button" onClick={toggleQuizMode}>
                                랜덤 모드로 전환하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 메인 퀴즈 렌더링
    return (
        <div className="quiz-container">
            {/* 페이지 번역기 추가 */}

            <div className="quiz-content">
                {/* 퀴즈 모드 토글 및 진행 상황 */}
                <div className="quiz-header">
                    <div className="quiz-mode-toggle">
                        <button
                            className={`mode-button ${quizMode === 'sequential' ? 'active' : ''}`}
                            onClick={() => setQuizMode('sequential')}
                        >
                            {quizMode === 'sequential' ? '순차 모드 ✓' : '순차 모드로 바꾸기'}
                        </button>
                        <button
                            className={`mode-button ${quizMode === 'random' ? 'active' : ''}`}
                            onClick={() => setQuizMode('random')}
                        >
                            {quizMode === 'random' ? '랜덤 모드 ✓' : '랜덤 모드로 바꾸기'}
                        </button>
                    </div>

                    {/* 진행 상황 표시 */}
                    {quizMode === 'sequential' && (
                        <div className="progress-indicator">
                            <span className="progress-text">
                                진행: {completedCount} / {totalQuizCount} 문제 완료
                            </span>
                            <div className="progress-bar">
                                <div
                                    className="progress-filled"
                                    style={{width: `${totalQuizCount ? (completedCount / totalQuizCount) * 100 : 0}%`}}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 메인 퀴즈 섹션 */}
                <div className="quiz-main">
                    <h1 className="quiz-title">선거 정보 퀴즈!</h1>
                    <p className="quiz-id">퀴즈 #{quizData?.id}</p>
                    <p className="quiz-question">{quizData?.question}</p>

                    {/* 퀴즈 선택지 */}
                    <div className="option-list">
                        {[1, 2, 3, 4].map((optionNumber) => (
                            <div
                                key={optionNumber}
                                className={`option-item`}
                                style={getOptionStyle(optionNumber)}
                                onClick={() => !showAnswer && handleOptionSelect(optionNumber)}
                            >
                                <div className={`option-radio ${selectedOption === optionNumber ? 'selected' : ''}`}></div>
                                <span className="option-text">{optionNumber}. {quizData?.[`option${optionNumber}`]}</span>


                            </div>
                        ))}
                    </div>

                    {/* 버튼 섹션 */}
                    <div className="quiz-buttons">
                        {/* 순차 모드일 때만 이전 문제 버튼 표시 */}
                        {quizMode === 'sequential' && (
                            <button
                                className="button secondary-button"
                                onClick={fetchPreviousQuiz}
                                disabled={loading || !quizData?.id}
                            >
                                이전 문제
                            </button>
                        )}

                        {/* 제출 또는 다음 문제 버튼 */}
                        {!showAnswer ? (
                            <button
                                className="button primary-button"
                                onClick={handleSubmit}
                                disabled={!selectedOption}
                            >
                                선택하기
                            </button>
                        ) : (
                            <button
                                className="button primary-button"
                                onClick={handleNextQuiz}
                            >
                                다음 문제
                            </button>
                        )}
                    </div>
                </div>

                {/* 정답 섹션 - 제출 후에만 표시 */}
                {showAnswer && (
                    <div className="answer-section">
                        <div className="answer-card">
                            <h2 className="answer-title">정답 : {quizData?.correctAnswer}번</h2>
                            <div className="answer-explanation">
                                <p className="explanation-title">&lt; 문제 해설 &gt;</p>
                                <p className="explanation-text">{quizData?.explanation}</p>
                            </div>

                            {/* 사용자 선택 정보 표시 */}
                            {selectedOption !== quizData?.correctAnswer && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '10px',
                                    backgroundColor: '#ffebee',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #f44336'
                                }}>
                                    <p style={{margin: '0', fontWeight: 'bold'}}>
                                        선택하신 답변: {selectedOption}번
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default ElectionQuiz;