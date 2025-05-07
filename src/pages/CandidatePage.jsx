import styled from "styled-components";
import CandidateCard from "../components/candidatecard/CandidateCard";
import { useEffect, useState } from "react";
import { candidateAPI } from "../api/CandidateApi";
import { electionAPI } from "../api/Election";

// 페이지 전체 스타일
const PageContainer = styled.div`
    background-color: #f9f9f9;
    width: 100%;
    //min-height: 100vh;
    color: #222;
    padding: 40px 20px;
`;

// 드롭다운 영역
const FilterSection = styled.div`
    max-width: 1200px;
    margin: 0 auto 30px;
    display: flex;
    justify-content: flex-end;
`;

const Select = styled.select`
    padding: 8px 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
`;

// 카드 그리드 레이아웃
const CardContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const Message = styled.div`
  text-align: center;
  font-size: 18px;
  margin-top: 40px;
`;

const Loader = styled.div`
  border: 6px solid #eee;
  border-top: 6px solid #1e90ff;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 60px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CandidatePage = () => {
    const [elections, setElections] = useState([]);
    const [selectedSgId, setSelectedSgId] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    // 선거 리스트 불러오기
    useEffect(() => {
        electionAPI.getElectionList()
            .then((data) => {
                setElections(data);
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    setSelectedSgId(latest.sgId);
                }
            })
            .catch(console.error);
    }, []);

    // 후보자 리스트 불러오기
    useEffect(() => {
        if (!selectedSgId) return;

        setLoading(true);
        candidateAPI.getCandidatesByElection(selectedSgId)
            .then((data) => setCandidates(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedSgId]);

    return (
        <PageContainer>
            <FilterSection>
                <Select value={selectedSgId} onChange={(e) => setSelectedSgId(e.target.value)}>
                    {elections.map((e) => (
                        <option key={e.sgId} value={e.sgId}>
                            {e.sgName} ({e.sgId})
                        </option>
                    ))}
                </Select>
            </FilterSection>

            {loading ? (
                <Loader />
            ) : candidates.length === 0 ? (
                <Message>해당 선거의 후보자 정보가 없습니다.</Message>
            ) : (
                <CardContainer>
                    {candidates.map((c, idx) => (
                        <CandidateCard key={idx} candidate={c} />
                    ))}
                </CardContainer>
            )}
        </PageContainer>
    );
};

export default CandidatePage;
