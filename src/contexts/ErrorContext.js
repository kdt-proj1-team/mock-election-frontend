// src/contexts/ErrorContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

// 에러 컨텍스트 생성
const ErrorContext = createContext(null);

// 에러 코드별 기본 메시지
const defaultErrorMessages = {
    'E400': '잘못된 요청입니다.',
    'E401': '로그인이 필요한 서비스입니다.',
    'E403': '접근 권한이 없습니다.',
    'E404': '요청한 페이지를 찾을 수 없습니다.',
    'E500': '서버 오류가 발생했습니다.',
    'E1001': '사용자를 찾을 수 없습니다.',
    'E3001': '이미 투표에 참여하셨습니다.',
    'E4002': '토큰 잔액이 부족합니다.',
    'NETWORK_ERROR': '네트워크 연결이 불안정합니다.',
    'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다.'
};

export const ErrorProvider = ({ children }) => {
    // 에러 상태
    const [error, setError] = useState(null);

    // 에러 설정 메서드
    const setErrorWithCode = useCallback((code, message, status = null, details = null) => {
        setError({
            code,
            message: message || defaultErrorMessages[code] || defaultErrorMessages['UNKNOWN_ERROR'],
            status,
            details,
            timestamp: new Date().toISOString()
        });
    }, []);

    // 에러 제거 메서드
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // API 에러 처리 헬퍼 메서드
    const handleApiError = useCallback((error) => {
        if (!error.response) {
            // 네트워크 오류
            setErrorWithCode('NETWORK_ERROR', '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
            return;
        }

        const { status, data } = error.response;

        // 백엔드에서 받은 에러 코드와 메시지 사용
        if (data && data.code) {
            setErrorWithCode(data.code, data.message, status, data.errors);
            return;
        }

        // 상태 코드 기반 기본 에러 설정
        switch (status) {
            case 400:
                setErrorWithCode('E400', '잘못된 요청입니다.', status);
                break;
            case 401:
                setErrorWithCode('E401', '로그인이 필요한 서비스입니다.', status);
                break;
            case 403:
                setErrorWithCode('E403', '접근 권한이 없습니다.', status);
                break;
            case 404:
                setErrorWithCode('E404', '요청한 페이지를 찾을 수 없습니다.', status);
                break;
            case 500:
                setErrorWithCode('E500', '서버 오류가 발생했습니다.', status);
                break;
            default:
                setErrorWithCode('UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.', status);
        }
    }, [setErrorWithCode]);

    const contextValue = {
        error,
        setError: setErrorWithCode,
        clearError,
        handleApiError
    };

    return (
        <ErrorContext.Provider value={contextValue}>
            {children}
        </ErrorContext.Provider>
    );
};

// Hook으로 제공
export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};