// hooks/useDeviceDetect.js - 기기 타입을 감지하는 커스텀 훅
import { useState, useEffect } from "react";

const useDeviceDetect = () => {
    const [deviceType, setDeviceType] = useState('desktop');

    useEffect(() => {
        // 모바일 기기 감지를 위한 정규식
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

        // 초기 기기 타입 감지 함수
        const checkDevice = () => {
            // User-Agent 기반 모바일 기기 감지
            const isMobileByAgent = mobileRegex.test(navigator.userAgent);

            // 화면 크기 기반 모바일 기기 감지
            const isMobileBySize = window.innerWidth <= 768;

            // 두 조건 중 하나라도 충족하면 모바일로 간주
            if (isMobileByAgent || isMobileBySize){
                setDeviceType('mobile');
            }else {
                setDeviceType('desktop');
            }
        };

        // 초기 실행
        checkDevice();

        // 화면 크기 변경 감지를 위한 이벤트 리스너
        const handleResize = () => {
            // 화면 크기 기준만 사용 (User-Agent는 변경되지 않음)
            if(window.innerWidth <= 768){
                setDeviceType('mobile');
            }else {
                setDeviceType('desktop');
            }
        };

        // 이벤트 리스너 등록
        window.addEventListener('resize', handleResize);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, []);

    return {
        deviceType,
        isMobile : deviceType === 'mobile',
        isDesktop : deviceType === 'desktop'
    };
};

export default useDeviceDetect;