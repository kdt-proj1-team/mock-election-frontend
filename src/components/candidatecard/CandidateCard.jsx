import React, {useState} from 'react';
import styled from 'styled-components';
import {useNavigate} from "react-router-dom";


const Card = styled.div`
    width: 250px;
    height: 320px;
    perspective: 1000px;
    cursor: pointer;
    position: relative;
`;

const CardInner = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    transform: ${({flipped}) => (flipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
`;

const Side = styled.div`
    width: 100%;
    height: 100%;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: white;
    position: absolute;
    backface-visibility: hidden;
`;

const CardFront = styled(Side)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const CardBack = styled(Side)`
    transform: rotateY(180deg);
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 핵심: 내용-버튼 분리 */
`;

const Photo = styled.img`
    width: 100%;
    height: 80%;
    object-fit: cover;
    border-radius: 8px;
`;

const Name = styled.h3`
    margin: 12px 0 4px 0;
`;

const Party = styled.p`
    font-weight: bold;
    color: #888;
`;

const DetailList = styled.ul`
    margin-top: 10px;
    padding-left: 20px;
`;

const DetailButton = styled.button`
    margin-top: 12px;
    padding: 6px 12px;
    background: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 6px;
    cursor: pointer;
`;


const CandidateCard = ({candidate}) => {
    const [flipped, setFlipped] = useState(false);
    const navigate = useNavigate(); // 추가

    const handleCardClick = () => {
        setFlipped(!flipped);
    };

    const handleDetailClick = (e) => {
        e.stopPropagation();
        navigate(`/candidate-detail/${candidate.sgId}/${candidate.jdName}`);
    };
    const formatBirthday = (raw) => {
        if (!raw || raw.length !== 8) return raw; // 유효성 검사
        const year = raw.substring(0, 4);
        const month = raw.substring(4, 6);
        const day = raw.substring(6, 8);
        return `${year}년 ${month}월 ${day}일`;
    };
    const defaultProfileUrl = "https://tse4.mm.bing.net/th?id=OIP.8V2TgiQxl7jLPiWNnM6v7AHaHa&pid=Api\n";


    return (
        <Card onClick={handleCardClick}>
            <CardInner flipped={flipped}>
                <CardFront>
                    <Photo
                        src={candidate.profileUrl ? candidate.profileUrl : defaultProfileUrl}
                        alt={candidate.name}
                    />
                    <Name>{candidate.name}</Name>
                    <Party>{candidate.jdName}</Party>
                </CardFront>

                <CardBack>
                    <h4>{candidate.name}</h4>
                    <DetailList>
                        <li>성별: {candidate.gender}</li>
                        <li>생년월일: {formatBirthday(candidate.birthday)}</li>
                        <li>학력: {candidate.edu}</li>
                        <li>경력1: {candidate.career1}</li>
                        <li>경력2: {candidate.career2}</li>
                    </DetailList>
                    <DetailButton onClick={handleDetailClick}>공약 보기</DetailButton>
                </CardBack>
            </CardInner>
        </Card>
    );
};

export default CandidateCard;
