import React, { useState } from 'react';
import './ElectionQuizIntro.css';

const ElectionQuizIntro = ({ onStartQuiz }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleStartQuiz = () => {
        setIsAnimating(true);
        // 애니메이션 효과 후 퀴즈 시작
        setTimeout(() => {
            onStartQuiz();
        }, 500);
    };

    return (
        <div className={`quiz-intro-container ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            <div className="intro-content">
                <div className="intro-header">
                    <h1 className="intro-title">선거 정보 퀴즈</h1>
                    <div className="title-decoration"></div>
                </div>

                <div className="intro-card">
                    <div className="intro-image">
                        {/* 투표함과 투표지 일러스트레이션 */}
                        <div className="illustration">
                            <div className="ballot-box">
                                <div className="ballot-top"></div>
                                <div className="ballot-slot"></div>
                                <div className="ballot-body"></div>
                                <div className="ballot-paper"></div>
                            </div>
                            <div className="vote-icons">
                                <span className="vote-icon">✓</span>
                                <span className="vote-icon delayed-1">✓</span>
                                <span className="vote-icon delayed-2">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="intro-description">
                        <h2>당신의 선거 지식을 테스트해보세요!</h2>
                        <p>
                            이 퀴즈는 선거 제도, 투표 방법, 선거 역사에 관한 다양한 문제들로 구성되어 있습니다.
                            재미있게 풀면서 선거에 대한 지식을 높여보세요.
                        </p>
                        <div className="intro-features">
                            <div className="feature-item">
                                <div className="feature-icon">📊</div>
                                <div className="feature-text">
                                    <h3>선거 제도 이해하기</h3>
                                    <p>선거 시스템과 투표 과정에 대해 배워보세요</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📝</div>
                                <div className="feature-text">
                                    <h3>투표권 행사하기</h3>
                                    <p>투표 방법과 중요성에 대해 알아보세요</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🏛️</div>
                                <div className="feature-text">
                                    <h3>민주주의 참여</h3>
                                    <p>민주주의 과정에서 시민의 역할을 이해하세요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className="start-button"
                    onClick={handleStartQuiz}
                >
                    퀴즈 시작하기
                    <span className="button-arrow">→</span>
                </button>
            </div>
        </div>
    );
};

export default ElectionQuizIntro;