import { useEffect, useRef } from "react";
import styled from "styled-components";
import ReCAPTCHA from "react-google-recaptcha";

const ModalBackdrop = styled.div`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const Message = styled.p`
  margin-bottom: 20px;
  font-size: 17px;
  text-align: center;
`;

const CancelButton = styled.button`
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  margin-top: 15px;
  padding: 5px 10px;
  font-size: 13px;
  cursor: pointer;
`;

const ReCaptchaModal = ({ visible, onVerify, onClose }) => {
  const recaptchaRef = useRef();

  useEffect(() => {
    if (!visible && recaptchaRef.current) {
      recaptchaRef.current.reset(); // visible이 false 될 때 자동 초기화
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <ModalBackdrop>
      <ModalBox>
        <Message>보안을 위해 확인 절차가 필요합니다.</Message>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          onChange={(token) => {
            onVerify(token);
          }}
        />
        <CancelButton onClick={onClose}>취소</CancelButton>
      </ModalBox>
    </ModalBackdrop>
  );
};

export default ReCaptchaModal;
