// PageTranslator.jsx

import React, { useState } from 'react';
import { TranslateAPI } from '../../api/TranslationApi';
import './PageTranslator.css';

function PageTranslator() {
    const [isTranslated, setIsTranslated] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('en'); // 기본값: 영어
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 원본 콘텐츠를 저장할 맵 - key: 요소 ID 또는 생성한 ID, value: 원본 텍스트
    const [originalContents, setOriginalContents] = useState({});

    // 페이지 번역 함수
    const translatePage = async () => {
        // 이미 번역된 상태라면 원본으로 복원
        if (isTranslated) {
            restoreOriginalContent();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 번역할 텍스트 요소 선택
            const elements = document.querySelectorAll('.quiz-container p, .quiz-container h1, .quiz-container h2, .quiz-container span, .quiz-container button, .option-text');

            // 원본 콘텐츠 저장
            const originals = {};

            // 번역할 텍스트와 해당 요소의 ID 매핑 준비
            const textsToTranslate = [];
            const elementMap = [];

            elements.forEach((el, index) => {
                // 빈 요소나 이미 고유 ID가 있는 요소는 건너뛰기
                if (!el.innerText || !el.innerText.trim()) return;

                // 요소에 ID가 없으면 임시 ID 부여
                const elementId = el.id || `translate-el-${index}`;
                if (!el.id) el.id = elementId;

                // 원본 텍스트 저장
                originals[elementId] = el.innerText;

                // 번역할 텍스트 추가
                textsToTranslate.push(el.innerText);
                elementMap.push(elementId);
            });

            setOriginalContents(originals);

            // 번역할 텍스트가 없으면 종료
            if (textsToTranslate.length === 0) {
                setIsLoading(false);
                setError('번역할 텍스트를 찾을 수 없습니다.');
                return;
            }

            // TranslateAPI를 사용하여 번역 요청
            const translations = await TranslateAPI.translateTexts(textsToTranslate, targetLanguage);

            // 번역 결과 적용
            translations.forEach((translation, index) => {
                const elementId = elementMap[index];
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerText = translation.translatedText;
                }
            });

            setIsTranslated(true);
        } catch (err) {
            console.error('페이지 번역 오류:', err);
            setError('번역 중 오류가 발생했습니다: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    // 원본 콘텐츠 복원
    const restoreOriginalContent = () => {
        Object.entries(originalContents).forEach(([elementId, originalText]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerText = originalText;
            }
        });

        setIsTranslated(false);
    };

    return (
        <div className="page-translator">
            <div className="translator-controls">
                <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="language-selector"
                    disabled={isLoading}
                >
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ru">Русский</option>
                </select>

                <button
                    onClick={translatePage}
                    disabled={isLoading}
                    className={`translate-button ${isTranslated ? 'active' : ''}`}
                >
                    {isLoading ? '번역 중...' : isTranslated ? '원문 보기' : '페이지 번역'}
                </button>
            </div>

            {error && <div className="translator-error">{error}</div>}
        </div>
    );
}

export default PageTranslator;