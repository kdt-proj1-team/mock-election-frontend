import React, { useState, useEffect } from 'react';
import './ElectionQuiz.css';
import quizAPI from '../../api/QuizApi'; // 분리된 API 임포트
import axios from 'axios';
import PageTranslator from '../translation/PageTranslator';

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


    // 완료 현황 업데이트
    const updateCompletionStatus = async () => {
        try {
            // 퀴즈를 완료한 후 완료 상태 업데이트
            const allQuizIds = await quizAPI.fetchAllQuizIds();
            const completedQuizzes = quizAPI.getCompletedQuizzes();

            setTotalQuizCount(allQuizIds.length);
            setCompletedCount(completedQuizzes.length);

            // 모든 퀴즈가 완료되었는지 확인
            const isAllCompleted = allQuizIds.every(id => completedQuizzes.includes(id));
            setAllCompleted(isAllCompleted);
        } catch (err) {
            console.error('완료 상태 확인 중 오류 발생:', err);
        }
    };

    // 컴포넌트 마운트시 첫 번째 퀴즈 데이터 가져오기
    useEffect(() => {
        if (quizMode === 'sequential') {
            fetchFirstQuiz();
        } else {
            fetchRandomQuiz();
        }

        // 완료 상태 업데이트
        updateCompletionStatus();
    }, [quizMode]);

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
            // 현재 퀴즈 ID가 이미 풀었던 퀴즈에 저장
            if (showAnswer) {
                quizAPI.saveCompletedQuiz(quizData.id);
                await updateCompletionStatus();
            }

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

    const handleNextQuiz = () => {
        // 정답을 확인한 후 다음 퀴즈로 넘어갈 때 완료 처리
        if (showAnswer) {
            quizAPI.saveCompletedQuiz(quizData.id);
            updateCompletionStatus();
        }

        if (quizMode === 'sequential') {
            fetchNextQuiz();
        } else {
            fetchRandomQuiz();
        }
    };

    const resetQuizzes = () => {
        quizAPI.resetCompletedQuizzes();
        updateCompletionStatus();
        if (quizMode === 'sequential') {
            fetchFirstQuiz();
        } else {
            fetchRandomQuiz();
        }
    };

    const toggleQuizMode = () => {
        setQuizMode(prevMode => prevMode === 'sequential' ? 'random' : 'sequential');
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
            <PageTranslator />
            <div className="quiz-content">
                {/* 퀴즈 모드 토글 및 진행 상황 */}
                <div className="quiz-header">
                    <div className="quiz-mode-toggle">
                        <button
                            className={`mode-button ${quizMode === 'sequential' ? 'active' : ''}`}
                            onClick={toggleQuizMode}
                        >
                            {quizMode === 'sequential' ? '순차 모드 ✓' : '순차 모드로 바꾸기'}
                        </button>
                        <button
                            className={`mode-button ${quizMode === 'random' ? 'active' : ''}`}
                            onClick={toggleQuizMode}
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
                        <div
                            className={`option-item ${showAnswer && quizData?.correctAnswer === 1 ? 'correct' : ''} ${showAnswer && selectedOption === 1 && quizData?.correctAnswer !== 1 ? 'incorrect' : ''}`}
                            onClick={() => !showAnswer && handleOptionSelect(1)}
                        >
                            <div className={`option-radio ${selectedOption === 1 ? 'selected' : ''}`}></div>
                            <span className="option-text">1. {quizData?.option1}</span>
                        </div>

                        <div
                            className={`option-item ${showAnswer && quizData?.correctAnswer === 2 ? 'correct' : ''} ${showAnswer && selectedOption === 2 && quizData?.correctAnswer !== 2 ? 'incorrect' : ''}`}
                            onClick={() => !showAnswer && handleOptionSelect(2)}
                        >
                            <div className={`option-radio ${selectedOption === 2 ? 'selected' : ''}`}></div>
                            <span className="option-text">2. {quizData?.option2}</span>
                        </div>

                        <div
                            className={`option-item ${showAnswer && quizData?.correctAnswer === 3 ? 'correct' : ''} ${showAnswer && selectedOption === 3 && quizData?.correctAnswer !== 3 ? 'incorrect' : ''}`}
                            onClick={() => !showAnswer && handleOptionSelect(3)}
                        >
                            <div className={`option-radio ${selectedOption === 3 ? 'selected' : ''}`}></div>
                            <span className="option-text">3. {quizData?.option3}</span>
                        </div>

                        <div
                            className={`option-item ${showAnswer && quizData?.correctAnswer === 4 ? 'correct' : ''} ${showAnswer && selectedOption === 4 && quizData?.correctAnswer !== 4 ? 'incorrect' : ''}`}
                            onClick={() => !showAnswer && handleOptionSelect(4)}
                        >
                            <div className={`option-radio ${selectedOption === 4 ? 'selected' : ''}`}></div>
                            <span className="option-text">4. {quizData?.option4}</span>
                        </div>
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
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ElectionQuiz;