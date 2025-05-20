import React from 'react';
import ErrorPage from './ErrorPage';

const NotFoundPage = () => {
    return (
        <ErrorPage
            code="E404"
            title="페이지를 찾을 수 없습니다"
            message="요청하신 페이지가 존재하지 않거나, 이동되었거나, 일시적으로 사용할 수 없습니다."
        />
    );
};

export default NotFoundPage;