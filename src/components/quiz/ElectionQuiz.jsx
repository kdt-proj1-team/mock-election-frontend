import React, { useState, useEffect } from 'react';
import './ElectionQuiz.css';
import ElectionQuizIntro from './ElectionQuizIntro';
import quizAPI from '../../api/QuizApi'; // 분리된 API 임포트

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
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#4caf50',
        color: 'white',
        opacity: 0,
        transform: 'translateY(-50%) scale(0.8)',
        animation: 'fadeInScale 0.5s forwards 0.3s'
    },
    yourChoiceLabel: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#ff9800',
        color: 'white',
        opacity: 0,
        transform: 'translateY(-50%) scale(0.8)',
        animation: 'fadeInScale 0.5s forwards'
    }
};

// 새로운 키프레임 애니메이션 추가
const keyframesStyle = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: translateY(-50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translateY(-50%) scale(1);
        }
    }
    
    @keyframes confetti {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }
    
    @keyframes rippleEffect {
        0% {
            transform: scale(1);
            opacity: 0.4;
        }
        100% {
            transform: scale(1.5);
            opacity: 0;
        }
    }
    
    @keyframes quizFadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes quizFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const ElectionQuiz = () => {
    // 인트로 페이지 표시 여부를 위한 상태 추가
    const [showIntro, setShowIntro] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizMode, setQuizMode] = useState('sequential'); // 'sequential' 또는 'random'
    const [allCompleted, setAllCompleted] = useState(false);
    const [totalQuizCount, setTotalQuizCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [animateQuiz, setAnimateQuiz] = useState(false); // 퀴즈 애니메이션 상태 추가
    const [showAnswerAnimation, setShowAnswerAnimation] = useState(false); // 정답 표시 애니메이션
    const [fadeDirection, setFadeDirection] = useState('in'); // 페이드 애니메이션 방향
    const [confettiActive, setConfettiActive] = useState(false); // 축하 효과 활성화 상태

    // 인트로 페이지에서 시작 버튼 클릭 시 호출될 함수
    const handleStartQuiz = () => {
        setShowIntro(false);
        initializeQuiz();
    };

    // 키프레임 스타일 요소 추가
    useEffect(() => {
        // 이미 존재하는지 확인
        if (!document.getElementById('quiz-keyframes')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'quiz-keyframes';
            styleEl.textContent = keyframesStyle;
            document.head.appendChild(styleEl);
        }

        return () => {
            // 컴포넌트 언마운트 시 제거
            const styleEl = document.getElementById('quiz-keyframes');
            if (styleEl) styleEl.remove();
        };
    }, []);

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

            // 모든 퀴즈 완료시 축하 효과 활성화
            if (isAllCompleted && !allCompleted) {
                setConfettiActive(true);
                setTimeout(() => setConfettiActive(false), 3000); // 3초 후 효과 비활성화
            }

            setAllCompleted(isAllCompleted);

            return { allQuizIds, completedQuizzes, isAllCompleted };
        } catch (err) {
            console.error('완료 상태 확인 중 오류 발생:', err);
            return null;
        }
    };

    // 퀴즈 초기화 및 데이터 로드 함수
    const initializeQuiz = async () => {
        // 컴포넌트 마운트 시 로컬 스토리지 초기화 (이전 상태 리셋)
        resetCompletedQuizzesAndSession();

        // 퀴즈 초기화 및 로드
        if (quizMode === 'sequential') {
            await fetchFirstQuiz();
        } else {
            await fetchRandomQuiz();
        }

        // 진행 상태 업데이트 (초기화된 상태)
        await updateCompletionStatus();

        // 마운트 애니메이션 적용
        setTimeout(() => {
            setAnimateQuiz(true);
        }, 100);
    };

    // 인트로 화면이 아닐 때만 언마운트 이벤트 리스너 설정
    useEffect(() => {
        if (!showIntro) {
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
        }
    }, [showIntro, quizMode]);

    // 완료된 퀴즈 및 세션 상태 초기화 함수
    const resetCompletedQuizzesAndSession = () => {
        console.log('퀴즈 진행 상태 및 세션 초기화');
        // localStorage에서 완료된 퀴즈 정보 삭제
        quizAPI.resetCompletedQuizzes();
        // 퀴즈 상태 정보 삭제
        localStorage.removeItem('quizState');
    };

    // 퀴즈 전환 애니메이션 함수
    const animateQuizTransition = async (fetchFunction) => {
        // 페이드 아웃 애니메이션 시작
        setFadeDirection('out');
        setAnimateQuiz(false);

        // 애니메이션 시간 동안 대기
        await new Promise(resolve => setTimeout(resolve, 300));

        // 새 퀴즈 데이터 가져오기
        await fetchFunction();

        // 페이드 인 애니메이션 설정
        setFadeDirection('in');
        setTimeout(() => {
            setAnimateQuiz(true);
        }, 100);
    };

    const fetchFirstQuiz = async () => {
        setLoading(true);
        setShowAnswer(false);
        setSelectedOption(null);
        setShowAnswerAnimation(false);

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
        setShowAnswerAnimation(false);

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
        await animateQuizTransition(async () => {
            setLoading(true);
            setShowAnswer(false);
            setSelectedOption(null);
            setShowAnswerAnimation(false);

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
        });
    };

    const fetchPreviousQuiz = async () => {
        if (!quizData || !quizData.id) return;
        await animateQuizTransition(async () => {
            setLoading(true);
            setShowAnswer(false);
            setSelectedOption(null);
            setShowAnswerAnimation(false);

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
        });
    };

    const handleOptionSelect = (optionNumber) => {
        // 옵션 선택 시 시각적 효과를 위한 리플 효과 추가
        setSelectedOption(optionNumber);

        // 리플 애니메이션 효과 (DOM 요소에 클래스 추가 후 제거)
        const optionElements = document.querySelectorAll('.option-item');
        if (optionElements[optionNumber - 1]) {
            // 클릭한 옵션에 리플 효과 클래스 추가
            optionElements[optionNumber - 1].classList.add('ripple-effect');

            // 애니메이션 후 클래스 제거
            setTimeout(() => {
                optionElements[optionNumber - 1].classList.remove('ripple-effect');
            }, 600);
        }
    };

    const handleSubmit = () => {
        if (selectedOption) {
            // 정답 제출 시 효과 추가
            setShowAnswer(true);

            // 정답 또는 오답 애니메이션 적용
            const isCorrect = selectedOption === quizData?.correctAnswer;
            const optionElements = document.querySelectorAll('.option-item');

            // 선택한 옵션에 애니메이션 클래스 추가
            if (optionElements[selectedOption - 1]) {
                optionElements[selectedOption - 1].classList.add(
                    isCorrect ? 'correct-answer' : 'incorrect-answer'
                );
            }

            // 정답 옵션에 애니메이션 클래스 추가 (선택한 것과 다른 경우)
            if (!isCorrect && optionElements[quizData?.correctAnswer - 1]) {
                setTimeout(() => {
                    optionElements[quizData?.correctAnswer - 1].classList.add('correct-answer');
                }, 500); // 약간 지연시켜 연속적인 효과 부여
            }

            // 정답 섹션 애니메이션 활성화
            setTimeout(() => {
                setShowAnswerAnimation(true);
            }, 300);
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

        // 애니메이션과 함께 다음 퀴즈 로드
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

        // 애니메이션과 함께 퀴즈 리셋
        await animateQuizTransition(async () => {
            if (quizMode === 'sequential') {
                await fetchFirstQuiz();
            } else {
                await fetchRandomQuiz();
            }
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

    // 애니메이션 스타일 계산
    const getAnimationStyle = () => {
        if (!animateQuiz) {
            return {
                opacity: 0,
                animation: fadeDirection === 'out' ? 'quizFadeOut 0.3s ease forwards' : 'none',
                transform: fadeDirection === 'out' ? 'translateY(-20px)' : 'translateY(20px)'
            };
        }

        return {
            animation: 'quizFadeIn 0.5s ease forwards',
            opacity: 1,
            transform: 'translateY(0)'
        };
    };

    // 인트로 페이지 렌더링
    if (showIntro) {
        return <ElectionQuizIntro onStartQuiz={handleStartQuiz} />;
    }

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

                        {/* 축하 효과 - 색종이 */}
                        {confettiActive && (
                            <div className="confetti-container" style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                pointerEvents: 'none',
                                zIndex: 100
                            }}>
                                {[...Array(50)].map((_, i) => {
                                    // 랜덤 색상 생성
                                    const colors = ['#fdcf58', '#757bc8', '#8ac926', '#ff595e', '#1982c4'];
                                    const color = colors[Math.floor(Math.random() * colors.length)];

                                    // 랜덤 위치 및 애니메이션 지연 생성
                                    const left = `${Math.random() * 100}%`;
                                    const top = `${Math.random() * 100}%`;
                                    const size = `${Math.random() * 10 + 5}px`;
                                    const delay = `${Math.random() * 3}s`;
                                    const duration = `${Math.random() * 2 + 2}s`;

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                left: left,
                                                top: top,
                                                width: size,
                                                height: size,
                                                backgroundColor: color,
                                                borderRadius: '50%',
                                                animation: `confetti ${duration} ease-in-out ${delay} infinite`,
                                                opacity: Math.random() * 0.7 + 0.3
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        <div className="completion-buttons">
                            <button className="button secondary-button" onClick={resetQuizzes}>
                                처음부터 다시 시작하기
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
            <div className="quiz-content" style={getAnimationStyle()}>
                {/* 퀴즈 헤더 및 진행 상황 */}
                <div className="quiz-header">
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
                    <div className={`answer-section ${showAnswerAnimation ? 'animate' : ''}`}>
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
                                    borderLeft: '4px solid #f44336',
                                    animation: 'fadeIn 0.5s ease forwards 0.5s',
                                    opacity: 0
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