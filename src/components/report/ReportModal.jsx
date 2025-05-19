import { useState } from 'react';
import { useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { reportTypeAPI } from '../../api/ReportTypeApi';
import { reportAPI } from '../../api/ReportApi';

// #region styled-components;
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 512px;
  overflow: hidden;
  margin-top: 80px;
`;

const ModalHeader = styled.div`
  padding: 22px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: #111827;
`;

const CloseButton = styled.button`
  color: #9ca3af;
  background-color: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    color: #6b7280;
  }
`;

const InfoSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const InfoLabel = styled.div`
  grid-column: span 2 / span 2;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
`;

const InfoValue = styled.div`
  grid-column: span 10 / span 10;
  font-size: 14px;
  color: #111827;
`;

const Section = styled.div`
  padding: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 16px;
`;

const ReasonCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const ReasonHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  border: 1px solid ${({ selected }) => (selected ? '#1f2937' : '#d1d5db')};
  background-color: ${({ selected }) => (selected ? '#1f2937' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px;
  
`;

const InnerDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: white;
`;

const ReasonName = styled.div`
  flex: 1;
  font-size: 14px;
  color: #111827;
  margin: 12px;
`;

const DescriptionButton = styled.button`
  height: 35px;
  padding: 8px;
  background-color: transparent;
  border: none;
  cursor: pointer;
`

const Description = styled.div`
  background-color: #f9fafb;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 96px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  margin-top: 16px;
  &:focus {
    outline: none;
    border-color: #1f2937;
    box-shadow: 0 0 0 1px #1f2937;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 50px;
  background-color: #111827;
  color: white;
  padding: 12px 16px;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #1f2937;
  }
`;
// #endregion

const ReportModal = ({ onClose, authorNickname, contentText, targetType, targetId }) => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reasonInput, setReasonInput] = useState('');
  const [openDescription, setOpenDescription] = useState(null);
  const [reportTypes, setReportTypes] = useState([]);

  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        const data = await reportTypeAPI.getReportTypes();
        setReportTypes(data);
      } catch (error) {
        console.error('신고 유형 불러오기 실패:', error);
      }
    };
    fetchReportTypes();
  }, []);

  const toggleDescription = (id) => {
    setOpenDescription(openDescription === id ? null : id);
  };

  const handleReportTypeSelect = (reportType) => {
    setSelectedReportType(reportType);
  };

  const handleSubmit = async () => {
    if (!selectedReportType) {
      alert('신고 사유를 선택해주세요.');
      return;
    }
    if (selectedReportType.code === 'OTHER' && !reasonInput.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }

    if (!window.confirm("신고는 관리자 검토 후 처리되며, 취소할 수 없습니다.\n신고를 진행하시겠습니까?")) {
      return;
    }

    const reportData = {
      reportTypeId: selectedReportType.id,
      targetType: targetType,
      targetId: targetId,
      reason: selectedReportType.code === 'OTHER' ? reasonInput : null
    };

    try {
      await reportAPI.create(reportData);
      onClose();
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고 처리 중 문제가 발생했습니다.");
    }
  };

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <Title>신고하기</Title>
          <CloseButton onClick={onClose}><FaTimes size={20} /></CloseButton>
        </ModalHeader>

        <InfoSection>
          <InfoRow>
            <InfoLabel>작성자</InfoLabel>
            <InfoValue>{authorNickname}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>내용</InfoLabel>
            <InfoValue>{contentText}</InfoValue>
          </InfoRow>
        </InfoSection>

        <Section>
          <SectionTitle>신고사유</SectionTitle>
          {reportTypes.map((reportType) => (
            <ReasonCard key={reportType.id}>
              <ReasonHeader onClick={() => handleReportTypeSelect(reportType)}>
                <RadioCircle selected={selectedReportType?.id === reportType.id}>
                  {selectedReportType?.id === reportType.id && <InnerDot />}
                </RadioCircle>
                <ReasonName>{reportType.name}</ReasonName>
                <DescriptionButton onClick={(e) => {
                  e.stopPropagation();
                  toggleDescription(reportType.id);
                }}>
                  <FaChevronDown
                    size={18}
                    style={{
                      transform: openDescription === reportType.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: '#9ca3af',
                    }}
                  />
                </DescriptionButton>
              </ReasonHeader>
              {openDescription === reportType.id && <Description>{reportType.description}</Description>}
            </ReasonCard>
          ))}

          {selectedReportType?.code === 'OTHER' && (
            <Textarea
              placeholder="신고 사유를 직접 입력해주세요."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
            />
          )}

          <SubmitButton onClick={handleSubmit}>신고하기</SubmitButton>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default ReportModal;
