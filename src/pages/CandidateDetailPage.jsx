import React, { useEffect, useState } from 'react';
import { useParams,useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { candidateAPI } from '../api/CandidateApi';

const PageContainer = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    padding: 40px 20px;
    background: #fff;
`;

const Layout = styled.div`
    display: flex;
    gap: 32px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const CandidateInfoCard = styled.div`
    width: 280px;
    background: #f1f3f5;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
`;

const SearchContainer = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    align-items: center;
`;

const Search = styled.input`
    flex: 1;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid #ccc;
    font-size: 16px;
    outline: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:focus {
        border-color: #adb5bd;
        box-shadow: 0 0 0 2px rgba(173, 181, 189, 0.4);
    }
`;

const SearchBtn = styled.button`
    padding: 0 16px;
    height: 46px;
    background-color: #6c757d;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #5a6268;
    }
`;

const PolicyListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const PolicyCard = styled.div`
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    overflow: hidden;
`;

const PolicyTitle = styled.div`
  font-weight: bold;
  padding: 16px;
  cursor: pointer;
  background: #e9ecef;
`;

const PolicyContent = styled.div`
  padding: 16px;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  white-space: pre-line;
`;

const Title = styled.h2`
  margin-bottom: 24px;
`;
const CandidateDetailPage = () => {
    const location = useLocation(); // ✅ 선언
    const { sgId, partyName } = useParams();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openIndex, setOpenIndex] = useState(null);

    const handleSearch = () => {
        console.log("검색어:", searchTerm);
    };

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const highlightText = (text, keyword) => {
        if (!keyword.trim()) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
                <mark key={index} style={{ backgroundColor: '#ffea00' }}>{part}</mark>
            ) : (
                <span key={index}>{part}</span>
            )
        );
    };

    useEffect(() => {
        if (!sgId || !partyName) return;
        candidateAPI.getCandidateDetail(sgId, partyName)
            .then((data) => setPolicies(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [sgId, partyName]);

    const candidateFromState = location.state?.candidate;
    const candidate = candidateFromState || policies[0]; // ✅ 우선순위 정리

    if (loading) return <PageContainer>로딩 중...</PageContainer>;
    if (!candidate) return <PageContainer>정책 정보가 없습니다.</PageContainer>;

    return (
        <PageContainer>
            <Title>정책 상세 정보 - ({partyName})</Title>

            <Layout>
                <CandidateInfoCard>
                    <img
                        src={candidate.profileUrl || '/default-profile.jpg'}
                        alt="후보자"
                        style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
                    />
                    <div><strong>이름:</strong> {candidate.name}</div>
                    <div><strong>정당:</strong> {candidate.jdName || candidate.partyName}</div>
                    <div><strong>학력:</strong> {candidate.edu || candidate.education || '정보 없음'}</div>
                    <div><strong>경력:</strong> {candidate.career1 || candidate.career || '정보 없음'}</div>
                </CandidateInfoCard>

                <div style={{ flex: 1 }}>
                    <SearchContainer>
                        <Search
                            placeholder="공약 키워드를 입력하세요"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchBtn onClick={handleSearch}>검색</SearchBtn>
                    </SearchContainer>

                    <PolicyListContainer>
                        {policies.map((policy, index) => (
                            <PolicyCard key={policy.id}>
                                <PolicyTitle onClick={() => toggleAccordion(index)}>
                                    {highlightText(policy.title, searchTerm)}
                                </PolicyTitle>
                                <PolicyContent isOpen={openIndex === index}>
                                    {policy.content.split('\n').map((line, idx) => (
                                        <p key={idx}>{highlightText(line, searchTerm)}</p>
                                    ))}
                                </PolicyContent>
                            </PolicyCard>
                        ))}
                    </PolicyListContainer>
                </div>
            </Layout>
        </PageContainer>
    );
};

export default CandidateDetailPage;