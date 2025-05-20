import React, { Component } from 'react';
import ErrorPage from '../pages/ErrorPage';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // 다음 렌더링에서 에러 페이지 표시
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // 에러 로깅
        console.error('에러 바운더리 캐치:', error, errorInfo);
        this.setState({ errorInfo });

        // 에러 추적 서비스에 에러 리포트
        // 예: Sentry.captureException(error);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    render() {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            // 커스텀 fallback이 제공된 경우
            if (fallback) {
                return React.cloneElement(fallback, { error, errorInfo, resetError: this.resetError });
            }

            // 기본 에러 페이지
            return (
                <ErrorPage
                    title="오류가 발생했습니다"
                    message="애플리케이션에서 예상치 못한 오류가 발생했습니다."
                    details={process.env.NODE_ENV === 'development' ? error?.message : null}
                    resetError={this.resetError}
                />
            );
        }

        return children;
    }
}

export default ErrorBoundary;