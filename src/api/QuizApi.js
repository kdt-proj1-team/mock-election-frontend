import axios from 'axios';




// Axios 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_QUIZ_API_URL || 'http://localhost/api/quiz',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 설정 - 모든 요청에 자동으로 인증 토큰 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 설정 - 오류 처리 자동화
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 인증 관련 오류 (401 Unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // 필요시 로그인 페이지로 리다이렉트
            // window.location.href = '/login';
        }

        // 오류 메시지 커스터마이징
        const errorMessage =
            (error.response && error.response.status === 401) ? '인증이 필요합니다. 다시 로그인해주세요.' :
                (error.response && error.response.status === 403) ? '이 작업을 수행할 권한이 없습니다.' :
                    (error.response && error.response.data && error.response.data.message) ? error.response.data.message :
                        '서버와 통신 중 오류가 발생했습니다.';

        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.status = error.response ? error.response.status : null;

        return Promise.reject(enhancedError);
    }
);

// 백엔드에서 받은 퀴즈 데이터를 프론트엔드 형식으로 변환하는 헬퍼 함수
const formatQuizData = (quiz) => {
    // 데이터가 없는 경우 처리
    if (!quiz) {
        throw new Error('퀴즈 데이터가 없습니다.');
    }

    const formattedQuiz = {
        id: quiz.id,
        question: quiz.question,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation
    };

    // options 배열을 option1, option2 형식으로 변환
    // 옵션 번호가 1,2,3,4 순서로 되어 있도록 정렬 추가
    if (quiz.options && Array.isArray(quiz.options)) {
        // 옵션 번호로 정렬
        const sortedOptions = [...quiz.options].sort((a, b) => a.optionNumber - b.optionNumber);

        // 정렬된 옵션을 1,2,3,4 키에 매핑
        sortedOptions.forEach((option, index) => {
            const optionKey = `option${index + 1}`;
            formattedQuiz[optionKey] = option.optionText;
        });
    }

    return formattedQuiz;
};

// 로컬 스토리지에 완료한 퀴즈 ID 저장
const saveCompletedQuiz = (quizId) => {
    const completedQuizzes = getCompletedQuizzes();
    if (!completedQuizzes.includes(quizId)) {
        completedQuizzes.push(quizId);
        localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
    }
};

// 로컬 스토리지에서 완료한 퀴즈 ID 목록 가져오기
const getCompletedQuizzes = () => {
    const saved = localStorage.getItem('completedQuizzes');
    return saved ? JSON.parse(saved) : [];
};

// 로컬 스토리지 초기화
const resetCompletedQuizzes = () => {
    localStorage.removeItem('completedQuizzes');
};

// 퀴즈 API 관련 함수들을 모아놓은 객체
export const quizAPI = {
    // 랜덤 퀴즈 가져오기
    fetchRandomQuiz: async () => {
        const response = await api.get('/random');
        return formatQuizData(response.data.data);
    },

    // ID로 특정 퀴즈 가져오기
    fetchQuizById: async (id) => {
        const response = await api.get(`/${id}`);
        return formatQuizData(response.data.data);
    },

    // 첫 번째 퀴즈 가져오기
    fetchFirstQuiz: async () => {
        const response = await api.get('/first');
        return formatQuizData(response.data.data);
    },

    // 다음 퀴즈 가져오기
    fetchNextQuiz: async (currentId) => {
        const response = await api.get(`/next/${currentId}`);
        return formatQuizData(response.data.data);
    },

    // 이전 퀴즈 가져오기
    fetchPreviousQuiz: async (currentId) => {
        const response = await api.get(`/previous/${currentId}`);
        return formatQuizData(response.data.data);
    },

    // 모든 퀴즈 가져오기
    fetchAllQuizzes: async () => {
        const response = await api.get('/all');
        return response.data.data.map(quiz => formatQuizData(quiz));
    },

    // 모든 퀴즈 ID만 가져오기
    fetchAllQuizIds: async () => {
        const response = await api.get('/all');
        return response.data.data.map(quiz => quiz.id);
    },

    // 완료한 퀴즈 저장
    saveCompletedQuiz,

    // 완료한 퀴즈 목록 가져오기
    getCompletedQuizzes,

    // 완료한 퀴즈 초기화
    resetCompletedQuizzes,

    // 모든 퀴즈를 완료했는지 확인
    checkAllQuizzesCompleted: async () => {
        const allQuizIds = await quizAPI.fetchAllQuizIds();
        const completedQuizzes = getCompletedQuizzes();

        // 모든 퀴즈가 완료되었는지 확인
        return allQuizIds.every(id => completedQuizzes.includes(id));
    }
};

export default quizAPI;