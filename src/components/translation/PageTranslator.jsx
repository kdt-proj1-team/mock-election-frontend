// PageTranslator.jsx - 헤더 요소 번역 기능 추가 및 이벤트 핸들러 유지

import React, { useState, useEffect } from 'react';
import { TranslateAPI } from '../../api/TranslationApi';
import './PageTranslator.css';

function PageTranslator({ inHeader = false }) {
    const [isTranslated, setIsTranslated] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('en'); // 기본값: 영어
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [translateProgress, setTranslateProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false); // 모바일에서 확장 상태 관리

    // 원본 콘텐츠를 저장할 맵 - key: 요소 ID 또는 생성한 ID, value: 원본 텍스트
    const [originalContents, setOriginalContents] = useState({});

    // 언어 선택 변경 시 로컬 스토리지에 저장
    useEffect(() => {
        // 로컬 스토리지에서 언어 설정 복원
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            setTargetLanguage(savedLanguage);
        }
    }, []);

    // 컴포넌트 외부 클릭 감지를 위한 이벤트 리스너
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 컴포넌트의 DOM 요소 가져오기
            const translatorElement = document.querySelector('.page-translator:not(.header-translator)');

            // 요소가 존재하고, 확장된 상태이며, 클릭이 컴포넌트 외부에서 발생한 경우
            if (
                translatorElement &&
                isExpanded &&
                !translatorElement.contains(event.target)
            ) {
                setIsExpanded(false);
            }
        };

        // 이벤트 리스너 추가
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        // 클린업 함수
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isExpanded]);

    // 언어 변경 핸들러
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setTargetLanguage(newLanguage);
        localStorage.setItem('preferredLanguage', newLanguage);

        // 이미 번역된 상태라면 새 언어로 다시 번역
        if (isTranslated) {
            restoreOriginalContent();
            setTimeout(() => translatePage(newLanguage), 100);
        }
    };

    // 아이콘 클릭 핸들러 (모바일용)
    const handleIconClick = () => {
        setIsExpanded(!isExpanded);
    };

    // 텍스트 노드 번역 함수 (이벤트 핸들러 보존을 위해)
    const translateTextNode = (node, translation) => {
        node.nodeValue = translation;
    };

    // 요소의 텍스트 노드 찾아서 번역하기
    const translateElementTextNodes = (element, translation) => {
        // 자식 노드가 없거나 텍스트 노드만 있는 경우
        if (element.childNodes.length === 0 ||
            (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE)) {
            if (element.innerText !== undefined) {
                element.innerText = translation;
            } else if (element.textContent !== undefined) {
                element.textContent = translation;
            }
            return;
        }

        // 자식 노드가 여러 개인 경우, 텍스트 노드만 찾아서 번역
        const textNodes = [];
        const getTextNodes = (node) => {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
                textNodes.push(node);
            } else if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    getTextNodes(node.childNodes[i]);
                }
            }
        };

        getTextNodes(element);

        // 찾은 텍스트 노드들이 모두 합쳐서 원본 텍스트와 일치하는지 확인
        const allText = textNodes.map(n => n.nodeValue.trim()).join(' ');
        if (allText.trim() === element.innerText.trim()) {
            // 모든 텍스트 노드들의 내용을 번역본으로 분할
            const words = translation.split(' ');
            let wordIndex = 0;

            for (let i = 0; i < textNodes.length; i++) {
                const node = textNodes[i];
                const nodeWordCount = node.nodeValue.trim().split(' ').length;

                // 이 노드에 할당할 번역된 단어들
                const nodeTranslation = words.slice(wordIndex, wordIndex + nodeWordCount).join(' ');
                translateTextNode(node, nodeTranslation);

                wordIndex += nodeWordCount;
            }
        } else {
            // 복잡한 구조인 경우 간단히 전체 내용 대체
            if (element.innerText !== undefined) {
                element.innerText = translation;
            } else if (element.textContent !== undefined) {
                element.textContent = translation;
            }
        }
    };

    // 페이지 번역 함수
    const translatePage = async (lang = targetLanguage) => {
        // 한국어는 원문이므로 번역하지 않고 원본으로 복원
        if (lang === 'ko') {
            restoreOriginalContent();
            return;
        }

        // 이미 번역된 상태라면 원본으로 복원
        if (isTranslated) {
            restoreOriginalContent();
            return;
        }

        setIsLoading(true);
        setError(null);
        setTranslateProgress(0);

        try {
            // 전역적으로 번역 가능한 태그 선택
            // 일반적인 텍스트 컨테이너 요소들 선택
            const selector = `
                p, h1, h2, h3, h4, h5, h6, 
                span:not(.material-icons):not(.icon), 
                button:not([aria-label]), 
                a:not([aria-label]), 
                label, 
                li, 
                td, 
                th, 
                div[class*="title"], 
                div[class*="text"], 
                div[class*="label"],
                div[class*="message"],
                div[class*="description"],
                .option-text,
                .quiz-question,
                .quiz-title,
                .explanation-text,
                .answer-title,
                .nav-link,
                .menu-item
            `;

            const elements = document.querySelectorAll(selector);
            console.log('잠재적 번역 대상 요소 수:', elements.length);

            // 원본 콘텐츠 저장
            const originals = {};

            // 번역할 텍스트와 해당 요소의 ID 매핑 준비
            const textsToTranslate = [];
            const elementMap = [];

            let validElementCount = 0;

            elements.forEach((el, index) => {
                // 번역 제외 속성 확인
                if (el.hasAttribute('data-no-translate')) {
                    return;
                }

                // PageTranslator 컴포넌트 자체는 번역에서 제외
                if (el.closest('.page-translator')) {
                    return;
                }

                // 보이지 않는 요소 스킵 (display:none은 제외하되, visibility:hidden이나 투명 요소는 포함)
                const style = window.getComputedStyle(el);
                if (style.display === 'none') {
                    return;
                }

                // 빈 요소 스킵
                const text = el.innerText || el.textContent;
                if (!text || !text.trim() || text.length < 2) {
                    return;
                }

                // 이미 영어나 숫자만 있는 경우 스킵 (선택적 기능)
                if (/^[a-zA-Z0-9\s.,!?:;()\-_'"]+$/.test(text) && lang === 'en') {
                    return;
                }

                // 요소에 고유 ID 부여
                const elementId = el.id || `translate-el-${index}`;
                if (!el.id) el.id = elementId;

                // 원본 텍스트 저장
                originals[elementId] = text;

                // 번역할 텍스트 추가
                textsToTranslate.push(text);
                elementMap.push(elementId);

                validElementCount++;
            });

            setOriginalContents(originals);

            // 번역할 텍스트가 없으면 종료
            if (validElementCount === 0) {
                console.log('번역할 텍스트를 찾을 수 없습니다.');
                setIsLoading(false);
                setError('번역할 텍스트를 찾을 수 없습니다. 페이지 내용을 확인해주세요.');
                return;
            }

            console.log(`${validElementCount}개의 텍스트 요소에 대해 번역을 시작합니다.`);

            // 큰 페이지의 경우 배치로 처리
            const BATCH_SIZE = 50; // 한 번에 처리할 텍스트 개수
            let translatedCount = 0;

            for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
                const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
                const batchMap = elementMap.slice(i, i + BATCH_SIZE);

                // 배치 번역 요청
                const translations = await TranslateAPI.translateTexts(batch, lang);

                // 번역 결과 적용
                translations.forEach((translation, index) => {
                    const elementId = batchMap[index];
                    const element = document.getElementById(elementId);
                    if (element) {
                        // 이벤트 핸들러 보존을 위한 방식으로 텍스트 변경
                        translateElementTextNodes(element, translation.translatedText);

                        // data 속성에 번역 여부 표시
                        element.setAttribute('data-translated', 'true');
                    }
                });

                translatedCount += batch.length;
                const progressPercentage = Math.round((translatedCount / textsToTranslate.length) * 100);
                setTranslateProgress(progressPercentage);

                console.log(`번역 진행 중: ${translatedCount}/${textsToTranslate.length} 완료 (${progressPercentage}%)`);
            }

            setIsTranslated(true);
        } catch (err) {
            console.error('페이지 번역 오류:', err);
            setError('번역 중 오류가 발생했습니다: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
            setTranslateProgress(100);
        }
    };

    // 원본 콘텐츠 복원
    const restoreOriginalContent = () => {
        Object.entries(originalContents).forEach(([elementId, originalText]) => {
            const element = document.getElementById(elementId);
            if (element) {
                // 이벤트 핸들러 보존을 위한 방식으로 텍스트 복원
                translateElementTextNodes(element, originalText);

                // 번역 표시 제거
                element.removeAttribute('data-translated');
            }
        });

        setIsTranslated(false);
        setOriginalContents({});
    };

    // 언어별 국기 아이콘 가져오기
    const getLanguageIcon = (code) => {
        const icons = {
            ko: '🇰🇷',
            en: '🇺🇸',
            ja: '🇯🇵',
            zh: '🇨🇳',
            es: '🇪🇸',
            fr: '🇫🇷',
            de: '🇩🇪',
            ru: '🇷🇺',
            vi: '🇻🇳',
            th: '🇹🇭',
        };
        return icons[code] || '🌐';
    };

    // 번역 상태에 따른 버튼 텍스트
    const getButtonText = () => {
        if (isLoading) return '번역 중...';
        if (isTranslated) return '원문';
        return inHeader ? '번역' : '번역하기';
    };

    // 컴포넌트 클래스 계산
    const componentClass = `page-translator ${inHeader ? 'header-translator' : ''} ${isTranslated ? 'is-translated' : ''} ${isExpanded ? 'expanded' : ''}`;

    return (
        <div className={componentClass} data-no-translate="true">
            {/* 모바일용 아이콘 버튼 */}
            <button
                className="translator-icon-button"
                onClick={handleIconClick}
                aria-label="번역 옵션 표시"
            >
                {getLanguageIcon(targetLanguage)}
            </button>

            <div className="translator-controls">
                <div className="language-selector-wrapper">
                    <select
                        value={targetLanguage}
                        onChange={handleLanguageChange}
                        className="language-selector"
                        disabled={isLoading}
                    >
                        <option value="ko">🇰🇷 한국어</option>
                        <option value="en">🇺🇸 English</option>
                        <option value="ja">🇯🇵 日本語</option>
                        <option value="zh">🇨🇳 中文</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="ru">🇷🇺 Русский</option>
                        <option value="vi">🇻🇳 Tiếng Việt</option>
                        <option value="th">🇹🇭 ภาษาไทย</option>
                    </select>
                </div>

                <button
                    onClick={() => translatePage()}
                    disabled={isLoading}
                    className={`translate-button ${isTranslated ? 'active' : ''}`}
                    aria-label="번역하기"
                >
                    {getButtonText()}
                </button>
            </div>

            {error && <div className="translator-error">{error}</div>}

            {isLoading && (
                <div className="translation-progress">
                    <div className="progress-bar">
                        <div className="progress-filled" style={{width: `${translateProgress}%`}}></div>
                    </div>
                    <div className="progress-text">{translateProgress}% 완료</div>
                </div>
            )}
        </div>
    );
}

export default PageTranslator;