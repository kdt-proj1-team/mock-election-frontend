import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import styled from "styled-components";
import useCategoryStore from "../store/categoryStore";
import HeroSection from "../components/community/HeroSection";
import CategorySection from "../components/community/CategorySection";
import PopularPostsSection from "../components/community/PopularPostsSection";
import CommunityNewsSection from "../components/community/CommunityNewsSection";
import PostList from "../components/community/PostList";
import { communityAPI } from "../api/CommunityApi";

const Container = styled.div`
    max-width: 1200px;
    margin: 30px auto;
    padding: 0 20px;
`;

const CommunityPage = () => {
    const location = useLocation();
    const isCommunityRoot = location.pathname === "/community";
    const [mainData, setMainData] = useState(null);

    const [searchParams] = useSearchParams();
    const categoryCode = searchParams.get("category");
    const { categories, fetchCategories, selectedCategory, setSelectedCategory, clearSelectedCategory } = useCategoryStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
    }, []);

    useEffect(() => {
        // 잘못된 접근 처리
        if (categoryCode && categories.length > 0) {
            const found = categories.find((cat) => cat.code === categoryCode);
            if (found) {
                setSelectedCategory(found);
            } else {
                clearSelectedCategory();
                navigate("/community", { replace: true }); // 잘못된 카테고리면 커뮤니티 첫 화면으로
            }
        } else {
            clearSelectedCategory();
        }
    }, [categoryCode, categories]);

    useEffect(() => {
        const fetchMainInfo = async () => {
            try {
                const data = await communityAPI.getMainInfo();
                setMainData(data);
            } catch (error) {
                console.error("커뮤니티 메인 정보 조회 실패", error);
            }
        };

        if (isCommunityRoot) {
            fetchMainInfo();
        }
    }, [isCommunityRoot]);

    return (
        <Container>
            {isCommunityRoot && !categoryCode && mainData && <HeroSection communityStats={mainData.communityStats} />}

            <CategorySection />

            {categoryCode ? (
                <PostList />
            ) : (
                isCommunityRoot &&
                mainData && (
                    <>
                        <PopularPostsSection popularPosts={mainData.popularPosts} />
                        <CommunityNewsSection recentNotices={mainData.recentNotices} />
                    </>
                )
            )}
        </Container>
    );
};

export default CommunityPage;