import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import {candidateAPI} from '../api/CandidateApi';

const PageContainer = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    padding: 40px 20px;
    background: #fff;
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);

    &:focus {
        border-color: #adb5bd;
        box-shadow: 0 0 0 2px rgba(173,181,189,0.4);
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
`;
const Title = styled.h2`
    margin-bottom: 24px;
`;

const PolicyCard = styled.div`
    white-space: pre-line;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    background: #f9f9f9;
`;

const PolicyTitle = styled.h3`
    margin-bottom: 8px;
`;

const CandidateDetailPage = () => {
    const {sgId, partyName} = useParams();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [focuse,setFocuse] = useState(null);

    const handleSearch = () => {
        
    }

    useEffect(() => {
        console.log(partyName);
        console.log(sgId);
        if (!sgId || !partyName) return;

        candidateAPI.getCandidateDetail(sgId, partyName)
            .then((data) => setPolicies(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [sgId, partyName]);

    if (loading) return <PageContainer>로딩 중...</PageContainer>;
    if (policies.length === 0) return <PageContainer>정책 정보가 없습니다.</PageContainer>;

    return (
        <PageContainer>
            <Title>정책 상세 정보 - ({partyName})</Title>

            <SearchContainer>
                <Search placeholder="공약 키워드를 입력하세요" onChange={(e)=>setSearchTerm(e.target.value)} />
                <SearchBtn onClick={handleSearch}>검색</SearchBtn>
            </SearchContainer>

            <PolicyListContainer>
                {policies.map((policy) => (
                    <PolicyCard key={policy.id}>
                        <PolicyTitle>{policy.title}</PolicyTitle>
                        {policy.content.split('\n').map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))}
                    </PolicyCard>
                ))}
            </PolicyListContainer>
        </PageContainer>
    );
};

export default CandidateDetailPage;
