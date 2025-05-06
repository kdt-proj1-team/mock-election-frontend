import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import {candidateAPI} from '../api/CandidateApi';

const PageContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    background: #fff;
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
            {policies.map((policy) => (
                <PolicyCard key={policy.id}>
                    <PolicyTitle>{policy.title}</PolicyTitle>
                    {policy.content.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                    ))}                </PolicyCard>
            ))}
        </PageContainer>
    );
};

export default CandidateDetailPage;
