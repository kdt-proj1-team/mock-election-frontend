import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import useAuthStore from './store/authStore';
import MockVoting from './components/mock-voting/MockVoting';
import MockVotingDetail from './components/mock-voting/MockVotingDetail';
import Header from './components/Header'
import CandidatePage from "./pages/CandidatePage";
import CandidateDetail from "./pages/CandidateDetailPage"
import CommunityPage from './pages/CommunityPage';
import PostEditor from "./components/community/PostEditor";
import PostDetail from './components/community/PostDetail'

const theme = {
    colors: {
        primary: '#4267b2',
        secondary: '#6c757d',
        light: '#f8f9fa',
        dark: '#343a40',
        background: '#ffffff',
        text: '#212529'
    },
    fonts: {
        body: "'Noto Sans KR', sans-serif",
        heading: "'Noto Sans KR', sans-serif"
    },
    breakpoints: {
        mobile: "576px",
        tablet: "768px",
        desktop: "1200px"
    }
};

const App = () => {
    const {isAuthenticated, role} = useAuthStore();

    // 관리자 전용 경로 보호를 위한 래퍼 컴포넌트
    const AdminRoute = ({children}) => {
        return isAuthenticated && role === 'ADMIN' ? children : <Navigate to="/"/>;
    };

    // 로그인한 사용자만 접근 가능한 경로 래퍼 컴포넌트
    const PrivateRoute = ({children}) => {
        return isAuthenticated ? children : <Navigate to="/login" replace/>;
    };

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Header/>
                <Routes>
                    {/* 기본 경로는 홈페이지로 설정 */}
                    <Route path="/" element={<HomePage/>}/>

                    {/* 로그인 페이지 경로 */}
                    <Route path="/login" element={<LoginPage/>}/>

                    {/* 가상투표 페이지 */}
                    <Route path="/mock-voting" element={<MockVoting/>}/>
                    <Route path="/mock-voting/:id" element={<MockVotingDetail/>}/>

                    {/* 관리자 페이지 경로 */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPage/>
                            </AdminRoute>
                        }
                    />
                    {/*후보자 페이지 경로*/}
                    <Route path="/candidate-compare" element={<CandidatePage/>}/>
                    <Route path="/candidate-detail/:sgId/:partyName" element={<CandidateDetail/>}/>
                    {/* 커뮤니티 페이지 경로 */}
                    <Route path="/community" element={<CommunityPage/>}/>
                    <Route
                        path="/community/board/write"
                        element={
                            <PrivateRoute>
                                <PostEditor mode="write"/>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/community/board/edit/:postId"
                        element={
                            <PrivateRoute>
                                <PostEditor mode="edit"/>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/community/post/:id" element={<PostDetail/>}/>

                    {/* 존재하지 않는 경로는 홈페이지로 리디렉션 */}
                    <Route path="*" element={<Navigate to="/"/>}/>
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;