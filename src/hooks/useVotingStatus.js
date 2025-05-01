import { useState, useEffect, useCallback } from 'react';
import { votingAPI } from '../api/VotingApi';
import { authAPI } from '../api/AuthApi';

/**
 * 사용자의 투표 상태를 확인하는 커스텀 훅
 * @param {string} sgId - 선거 ID
 * @returns {Object} { hasVoted, loading, error, checkVoteStatus }
 */
const useVotingStatus = (sgId) => {
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseData, setResponseData] = useState(null);

    // 투표 상태 확인 함수
    const checkVoteStatus = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 방법 1: 선거별 투표 상태 확인 API 사용
            try {
                console.log(`선거별 투표 상태 확인 중: ${sgId}`);
                const statusResponse = await votingAPI.checkVoteStatus(sgId);

                console.log('응답 전체:', statusResponse);

                // 응답 형태에 따른 처리 (직접 true/false 또는 객체 형태)
                let hasVoted = false;

                if (typeof statusResponse === 'boolean') {
                    // 직접 불리언 값이 반환된 경우
                    hasVoted = statusResponse;
                } else if (statusResponse && typeof statusResponse.data?.data !== 'undefined') {
                    // 객체 형태로 반환된 경우
                    hasVoted = statusResponse.data.data === true || statusResponse.data.data === "true";
                } else if (statusResponse && typeof statusResponse.data !== 'undefined') {
                    // data 직접 반환된 경우
                    hasVoted = statusResponse.data === true || statusResponse.data === "true";
                }

                console.log(`선거별 투표 상태 결과 (최종): ${hasVoted}`);
                setResponseData(statusResponse);
                setHasVoted(hasVoted);
                setLoading(false);
                return hasVoted;
            } catch (statusError) {
                console.log('선거별 투표 상태 확인 실패, 일반 사용자 정보로 확인합니다:', statusError);
            }

            // 방법 2: 사용자 정보에서 투표 상태 확인
            const userResponse = await authAPI.getUserInfo();
            console.log('사용자 정보 응답:', userResponse);
            const isVoted = userResponse.data?.data?.isElection === true;
            console.log('사용자 정보 기반 투표 상태:', isVoted, userResponse.data);

            setHasVoted(isVoted);
            return isVoted;
        } catch (err) {
            console.error('투표 상태 확인 중 오류 발생:', err);
            setError('투표 상태를 확인하는 중 오류가 발생했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [sgId]);

    // 컴포넌트 마운트 시 투표 상태 확인
    useEffect(() => {
        if (sgId) {
            checkVoteStatus();
        } else {
            setLoading(false);
        }
    }, [sgId, checkVoteStatus]);

    return {
        hasVoted,
        loading,
        error,
        responseData,
        checkVoteStatus
    };
};

export default useVotingStatus;