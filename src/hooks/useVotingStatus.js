// src/hooks/useVotingStatus.js
import { useState, useEffect } from 'react';
import { votingAPI } from '../api/VotingApi';
import { authAPI } from '../api/AuthApi';
import useAuthStore from '../store/authStore';

/**
 * 사용자의 투표 상태를 확인하는 커스텀 훅
 * @param {string} sgId - 선거 ID
 * @returns {Object} 투표 상태 정보
 */
const useVotingStatus = (sgId) => {
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuthStore();

    // 투표 상태 확인 함수
    const checkVoteStatus = async () => {
        if (!isAuthenticated || !sgId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 방법 1: 투표 API를 통해 확인
            const voteResponse = await votingAPI.checkVoteStatus(sgId);
            setHasVoted(voteResponse);
            setLoading(false);
        } catch (voteError) {
            try {
                // 방법 2: 사용자 정보 API를 통해 확인 (백업 방법)
                const userResponse = await authAPI.getUserInfo();
                const userData = userResponse.data.data;

                if (userData) {
                    setHasVoted(userData.isElection || false);
                }

                setLoading(false);
            } catch (userError) {
                setError('투표 상태를 확인할 수 없습니다.');
                setLoading(false);
            }
        }
    };

    // 컴포넌트 마운트 시와 sgId가 변경될 때 투표 상태 확인
    useEffect(() => {
        checkVoteStatus();
    }, [sgId, isAuthenticated]);

    return {
        hasVoted,
        loading,
        error,
        checkVoteStatus
    };
};

export default useVotingStatus;