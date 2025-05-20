import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useError } from '../contexts/ErrorContext';

// 에러 코드별 아이콘 및 스타일 설정
const errorStyles = {
    'E401': { icon: '🔒', color: '#FF9800', bgColor: '#FFF3E0' },
    'E403': { icon: '🚫', color: '#F44336', bgColor: '#FFEBEE' },
    'E404': { icon: '🔍', color: '#607D8B', bgColor: '#ECEFF1' },
    'E500': { icon: '⚠️', color: '#D32F2F', bgColor: '#FFEBEE' },
    'NETWORK_ERROR': { icon: '📡', color: '#0D47A1', bgColor: '#E3F2FD' },
    'default': { icon: '❓', color: '#455A64', bgColor: '#ECEFF1' },
};

const ErrorPage = ({ code, title, message, details, resetError, onRetry, canReturn = true }) => {
    const navigate = useNavigate();
    const { error: contextError, clearError } = useError();

    // props 또는 컨텍스트에서 에러 정보 가져오기
    const errorInfo = code ? { code } : contextError;
    const errorCode = errorInfo?.code || 'default';
    const errorTitle = title || errorInfo?.message || '오류가 발생했습니다';
    const errorMessage = message || '요청을 처리하는 중 문제가 발생했습니다';
    const errorDetails = details || (process.env.NODE_ENV === 'development' ? errorInfo?.details : null);
    const style = errorStyles[errorCode] || errorStyles.default;

    const handleGoBack = () => {
        if (resetError) resetError();
        if (clearError) clearError();
        navigate(-1);
    };

    const handleGoHome = () => {
        if (resetError) resetError();
        if (clearError) clearError();
        navigate('/');
    };

    const handleRetry = () => {
        if (resetError) resetError();
        if (clearError) clearError();
        if (onRetry) onRetry();
        else window.location.reload();
    };

    return (
        <div className="error-page" style={{
            padding: '40px 20px',
            maxWidth: '600px',
            margin: '60px auto',
            textAlign: 'center',
            backgroundColor: style.bgColor,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <div className="error-icon" style={{ fontSize: '64px', marginBottom: '20px' }}>
                {style.icon}
            </div>

            {errorCode !== 'default' && (
                <div className="error-code" style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: style.color,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    marginBottom: '16px'
                }}>
                    {errorCode}
                </div>
            )}

            <h1 style={{
                color: style.color,
                marginBottom: '16px',
                fontSize: '24px'
            }}>
                {errorTitle}
            </h1>

            <p style={{ marginBottom: '24px', fontSize: '16px', color: '#37474F' }}>
                {errorMessage}
            </p>

            {errorDetails && (
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    color: '#455A64',
                    overflowX: 'auto'
                }}>
                    <pre style={{ margin: 0 }}>{errorDetails}</pre>
                </div>
            )}

            <div className="error-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {canReturn && (
                    <>
                        <button
                            onClick={handleGoBack}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${style.color}`,
                                color: style.color,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            이전으로
                        </button>

                        <button
                            onClick={handleGoHome}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${style.color}`,
                                color: style.color,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            홈으로
                        </button>
                    </>
                )}

                <button
                    onClick={handleRetry}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: style.color,
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    다시 시도
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;