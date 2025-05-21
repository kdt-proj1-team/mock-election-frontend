import axios from 'axios';

/**
 * Axios 인스턴스에 전역 에러 처리 인터셉터를 설정합니다.
 *
 * @param {Object} errorHandler - 에러 처리 함수를 포함한 객체
 * @param {Function} errorHandler.handleApiError - API 에러 처리 함수
 * @param {Function} errorHandler.onUnauthorized - 인증 만료 처리 함수 (선택적)
 */
export const setupAxiosInterceptors = (errorHandler) => {
    // 응답 인터셉터
    axios.interceptors.response.use(
        response => response,
        error => {
            // 에러 로깅
            if (error.response) {
                const { status, data } = error.response;
                console.error(`API 오류 (${status}):`, data);

                // 인증 만료 처리 (401)
                if (status === 401 && errorHandler.onUnauthorized) {
                    errorHandler.onUnauthorized();
                }
            } else if (error.request) {
                console.error('API 요청 오류 (응답 없음):', error.request);
            } else {
                console.error('API 요청 설정 오류:', error.message);
            }

            // 전역 에러 처리기에 에러 전달
            if (errorHandler.handleApiError) {
                errorHandler.handleApiError(error);
            }

            return Promise.reject(error);
        }
    );
};