// components/polling-station/PollingStationFinder.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from 'styled-components';
import useDeviceDetect from "../../hooks/useDeviceDetect";
import pollingStationAPI from '../../api/PollingStationAPI';
import axios from 'axios';

// 스타일 컴포넌트 정의 (간략화)
const Container = styled.div`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  height: ${({ isMobile }) => (isMobile ? 'auto' : 'calc(100vh - 60px)')};
  width: 100%;
`;

const Sidebar = styled.div`
  width: ${({ isMobile }) => (isMobile ? '100%' : '350px')};
  height: ${({ isMobile }) => (isMobile ? 'auto' : '100%')};
  background-color: #f8f9fa;
  overflow-y: auto;
  border-right: ${({ isMobile }) => (isMobile ? 'none' : '1px solid #e0e0e0')};
  z-index: 1;
`;

const MapContainer = styled.div`
  flex: 1;
  height: ${({ isMobile }) => (isMobile ? '60vh' : '100%')};
  position: relative;
  z-index: 0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchBox = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const LocationInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GetLocationButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #888888;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #888888;
  }
`;

const InstructionMessage = styled.div.attrs(props => ({
    // visible 속성을 HTML 속성으로 전달하지 않고, 스타일 계산에만 사용
    style: {
        display: props.visible ? 'block' : 'none'
    }
}))`
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 5;
`;

const PollingStationList = styled.div`
  padding: 0;
`;

const PollingStationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

// 메인 컴포넌트
const PollingStationFinder = () => {
    const { isMobile, isDesktop } = useDeviceDetect();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [stations, setStations] = useState([]);
    const [allStations, setAllStations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showInstruction, setShowInstruction] = useState(false);

    const fetchPollingStationsRef = useRef();
    const reverseGeocodeRef  = useRef();

    // 주소를 좌표로 변환하는 함수
    const geocodeAddress = useCallback(async (address) => {
        try {
            // 네이버 지도 API의 지오코딩 사용
            if (window.naver && window.naver.maps && window.naver.maps.Service) {
                return new Promise((resolve, reject) => {
                    const geocoder = new window.naver.maps.Service.Geocoder();

                    geocoder.geocode({
                        query:address
                    }, function (status, response){
                        if (status === window.naver.maps.Service.Status.OK){
                            const result = response.v2.addresses[0];
                            if (result) {
                                resolve({
                                    lat:parseFloat(result.y),
                                    lng:parseFloat(result.x)
                                });
                            }else {
                                reject(new Error("검색 결과가 없습니다."));
                            }
                        }else {
                            reject(new Error("지오코딩 실패: " + status));
                        }
                    });
                });
            }
        } catch (error) {
            console.error("지오코딩 오류:", error);
            return null;
        }
    }, []);


    // 프론트엔드에서 백엔드 API 호출
    const reverseGeocode = async (latitude, longitude) => {
        try {
            const response = await axios.get('/api/map/reverse-geocode', {
                params: {
                    latitude,
                    longitude
                }
            });

            // 응답 처리
            if (response.data && response.data.results && response.data.results.length > 0) {
                const admResult = response.data.results.find(result => result.name === 'admcode');
                if (admResult && admResult.region) {
                    return {
                        sdName: admResult.region.area1.name,
                        wiwName: admResult.region.area2.name
                    };
                }
            }

            throw new Error('행정구역 정보를 찾을 수 없습니다.');
        } catch (error) {
            console.error('역지오코딩 API 호출 실패:', error);
            throw error;
        }
    };

    // 모든 투표소에 위도/경도 정보 추가 후 지도에 표시
    const addGeocodingToStationsAndShowMarkers = useCallback(async (stations) => {
        const stationsWithCoords = [...stations];
        const newMarkers = [...markers]; // 기존 마커 배열

        // 기존 마커 외에 추가된 투표소 마커는 제거
        if (newMarkers.length > 1) {
            for (let i = 1; i < newMarkers.length; i++) {
                newMarkers[i].setMap(null);
            }
            // 첫 번째 마커(위치 마커)만 남김
            newMarkers.splice(1);
        }

        // 동시에 너무 많은 지오코딩 요청을 방지하기 위해 처음 3개만 처리
        const maxToProcess = Math.min(3, stations.length);

        for (let i = 0; i < maxToProcess; i++) {
            if (!stations[i].lat || !stations[i].lng) {
                try {
                    const coords = await geocodeAddress(stations[i].address);
                    if (coords) {
                        stationsWithCoords[i] = {
                            ...stationsWithCoords[i],
                            lat: coords.lat,
                            lng: coords.lng
                        };

                        // 투표소 위치에 마커 추가
                        if (map) {
                            const position = new window.naver.maps.LatLng(coords.lat, coords.lng);
                            const marker = new window.naver.maps.Marker({
                                position: position,
                                map: map,
                                title: stations[i].name,
                                icon: {
                                    content: `<div style="background-color: #888888; color: white; padding: 5px; border-radius: 50%; width: 10px; height: 10px; text-align: center; font-weight: bold;">${i+1}</div>`,
                                    anchor: new window.naver.maps.Point(12, 12)
                                }
                            });

                            // 마커 클릭 이벤트
                            window.naver.maps.Event.addListener(marker, 'click', () => {
                                const infoWindow = new window.naver.maps.InfoWindow({
                                    content: `
                                    <div style="padding: 10px; max-width: 300px;">
                                        <h3>${stations[i].name}</h3>
                                        <p>${stations[i].placeName}</p>
                                        <p>${stations[i].address}</p>
                                        <p>층: ${stations[i].floor}</p>
                                    </div>
                                `
                                });
                                infoWindow.open(map, marker);
                            });

                            // 마커 배열에 추가
                            newMarkers.push(marker);
                        }
                    }
                    // 요청 사이에 짧은 딜레이 추가 (API 제한 방지)
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`'${stations[i].address}' 지오코딩 실패:`, error);
                }
            } else {
                // 이미 좌표가 있는 경우 마커 추가
                if (map) {
                    const position = new window.naver.maps.LatLng(stations[i].lat, stations[i].lng);
                    const marker = new window.naver.maps.Marker({
                        position: position,
                        map: map,
                        title: stations[i].name,
                        icon: {
                            content: `<div style="background-color: #888888; color: white; padding: 5px; border-radius: 50%; width: 10px; height: 10px; text-align: center; font-weight: bold;">${i+1}</div>`,
                            anchor: new window.naver.maps.Point(12, 12)
                        }
                    });

                    // 마커 클릭 이벤트
                    window.naver.maps.Event.addListener(marker, 'click', () => {
                        const infoWindow = new window.naver.maps.InfoWindow({
                            content: `
                            <div style="padding: 10px; max-width: 300px;">
                                <h3>${stations[i].name}</h3>
                                <p>${stations[i].placeName}</p>
                                <p>${stations[i].address}</p>
                                <p>층: ${stations[i].floor}</p>
                            </div>
                        `
                        });
                        infoWindow.open(map, marker);
                    });

                    // 마커 배열에 추가
                    newMarkers.push(marker);
                }
            }
        }

        // 마커 상태 업데이트
        setMarkers(newMarkers);

        return stationsWithCoords;
    }, [geocodeAddress, map, markers]);


    // 두 지점 간 거리 계산 함수 (Haversine 공식)
    const calculationDistance = useCallback((lat1, lng1, lat2, lng2) => {
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        // 거리가 1km 미만이면 m 단위로, 아니면 km 단위로 표시
        return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    }, []);

    // 투표소 거리 계산 및 정렬
    const calculateAndSortStations = useCallback((location, stationsToSort = []) => {
        if(!location) return [];

        // 모든 투표소와의 거리 계산
        const stationsWithDistance = stationsToSort.map(station => {
            if (!station.lat || !station.lng) {
                return {
                    ...station,
                    distanceText: "위치 정보 없음",
                    distanceValue: Number.MAX_VALUE
                };
            }

            const distanceText = calculationDistance(
                location.latitude,
                location.longitude,
                station.lat,
                station.lng
            );

            // 거리 계산을 위한 숫자값 (정렬용)
            const distanceValue = parseFloat(distanceText.replace('km', '').replace('m', '')) *
                                                (distanceText.includes('km') ? 1000 : 1);

            return {
                ...station,
                distanceText,
                distanceValue
            };
        });

        // 거리순 정렬
        return stationsWithDistance.sort((a,b) => a.distanceValue - b.distanceValue)
    }, [calculationDistance]);

    // 투표소 데이터 가져오기 함수
    const fetchPollingStations = useCallback(async  (sdName, wiwName) => {
        try {
            setIsLoading(true);
            setError(null);

            // 선거ID는 실제 선거에 맞게 변경 필요
            // 예시: 20220309 (2022년 3월 9일 실시된 선거)
            const sgId = "20250603";

            // 선거일 투표소 조회
            const response = await pollingStationAPI.getPrePollingStations({
                sgId : sgId,
                sdName : sdName || "서울특별시", // 기본값 설정
                wiwName : wiwName || "", // 빈 값이면 해당 시도의 모든 구/시/군 조회
                numOfRows : 3, // 한 번에 가져올 데이터 수
                pageNo : 1
            });

            console.log("API 응답:", response);

            // XML 응답 또는 JSON 응답 처리
            let stationItems = [];

            // 백엔드에서 제공하는 데이터 구조에 맞게 처리
            if (response && response.response && response.response.body) {
                // 이미 JSON으로 파싱된 경우
                const items = response.response.body.items.item || [];
                stationItems = Array.isArray(items) ? items : [items];
            } else if (response && response.data && response.data.response) {
                // 다른 형태의 JSON 응답
                const items = response.data.response.body.items.item || [];
                stationItems = Array.isArray(items) ? items : [items];
            } else {
                // 응답 구조를 확인하기 위해 로깅
                console.log("예상치 못한 응답 형식:", response);

                // 일반적인 데이터 탐색 시도
                if (typeof response === 'object' && response !== null) {
                    const keys = Object.keys(response);
                    console.log("최상위 응답 키:", keys);

                    if (keys.length > 0 && response[keys[0]]) {
                        console.log(`${keys[0]} 내부 구조:`, response[keys[0]]);
                    }
                }
            }

            console.log("찾은 투표소 아이템:", stationItems);

            // 투표소 데이터 변환
            const transformedStations = stationItems.map((item, index) => ({
                id: item.num || index + 1,
                name: item.evPsName || item.psName || `투표소 ${index + 1}`, // 사전투표소명 또는 선거일투표소명
                address: item.addr || "",
                placeName: item.placeName || "",
                sdName: item.sdName || "",
                wiwName: item.wiwName || "",
                emdName: item.emdName || "",
                floor: item.floor || "",
                lat: null,
                lng: null
            }));

            console.log("변환된 투표소 데이터:", transformedStations);

            // 데이터가 비어있는지 확인
            if (transformedStations.length === 0) {
                console.log("변환된 데이터가 비어있어 대체 데이터 사용");
                throw new Error("투표소 데이터가 없습니다");
            }

            // 상태 업데이트
            setAllStations(transformedStations);

            // 위치 정보가 있으면 거리 계산 및 정렬
            if (selectedLocation) {
                const stationsWithGeocode = await addGeocodingToStationsAndShowMarkers(transformedStations);
                const sortedStations = calculateAndSortStations(selectedLocation, stationsWithGeocode);
                setStations(sortedStations);
            } else {
                setStations(transformedStations);
            }

        } catch (error) {
            console.error("투표소 정보를 가져오는데 실패했습니다:", error);
            setError(`투표소 정보를 가져오는데 실패했습니다: ${error.message}`);

            // 오류 발생 시 빈 배열로 초기화
            setAllStations([]);
            setStations([]);
        }
    }, [selectedLocation, calculateAndSortStations, addGeocodingToStationsAndShowMarkers]);

    // 현재 위치 가져오기
    const getCurrentLocation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (navigator.geolocation) { // 위치 정보 기능을 사용할 수 있음
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    setCurrentLocation(location);
                    setSelectedLocation(location);

                    // 지도가 초기화되었다면 현재 위치로 이동
                    if (map) {
                        // 네이버 지도 API를 사용하여 지도 중심점 이동
                        const naverLatLng = new window.naver.maps.LatLng(
                            location.latitude,
                            location.longitude
                        );

                        // 지도 중심 이동
                        map.setCenter(naverLatLng);

                        // 현재 위치 마커 설정
                        if (markers.length > 0) {
                            const locationMarker = markers[0];
                            locationMarker.setPosition(naverLatLng);
                            locationMarker.setVisible(true);
                        }
                    }

                    try {
                        // 네이버 REST API를 사용하여 역지오코딩
                        const region = await reverseGeocode(location.latitude, location.longitude);

                        if (region && region.sdName && region.wiwName) {
                            console.log('현재 위치의 행정구역:', region);

                            // 해당 행정구역의 투표소 정보 가져오기
                            await fetchPollingStations(region.sdName, region.wiwName);
                        } else {
                            console.error('행정구역 정보를 가져오는데 실패했습니다.');
                            setError('행정구역 정보를 가져오는데 실패했습니다.');

                            // 기본값으로 서울특별시 종로구 사용
                            await fetchPollingStations("서울특별시", "종로구");
                        }
                    } catch (error) {
                        console.error('위치 정보 처리 중 오류:', error);
                        setError('위치 정보 처리 중 오류가 발생했습니다.');

                        // 기본값으로 서울특별시 종로구 사용
                        await fetchPollingStations("서울특별시", "종로구");
                    } finally {
                        setIsLoading(false);
                    }
                },
                (error) => {
                    console.error('위치 정보를 가져오는데 실패했습니다:', error);
                    setError('위치 정보를 가져오는데 실패했습니다. 위치 권한을 허용해주세요.');
                    setIsLoading(false);

                    // 오류 시 기본값 사용
                    fetchPollingStationsRef.current("서울특별시", "종로구");
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else { // 위치 정보 기능을 사용할 수 없음 (지원되지 않음)
            setError('이 브라우저에서는 위치 정보 기능을 지원하지 않습니다.');
            setIsLoading(false);

            // 위치 정보 지원 안 함 - 기본값 사용
            fetchPollingStations("서울특별시", "종로구");
        }
    }, [map, markers, fetchPollingStations]);

    // ref 업데이트
    useEffect(() => {
        fetchPollingStationsRef.current = fetchPollingStations;
        reverseGeocodeRef.current = reverseGeocode;
    }, [fetchPollingStations, reverseGeocode]);

    // 지도 클릭 이벤트 핸들러 (PC에서만 동작)
    const handleMapClick = useCallback(async(e) => {
        if(!isDesktop) return;

        // 로딩 상태 설정
        setIsLoading(true);

        // 네이버 지도 API의 클릭 이벤트에서 위도/경도 가져오기
        const point = e.coord;
        const location = {
            latitude: point.y,
            longitude: point.x
        };

        setSelectedLocation(location);

        // 마커 위치 설정
        if (markers.length > 0) {
            markers[0].setPosition(new window.naver.maps.LatLng(location.latitude, location.longitude));
            markers[0].setVisible(true);
        }

        console.log('지도에 위치 마커 생성:', location);

        try {
            console.log("클릭 위치:", location.latitude, location.longitude);

            // 네이버 REST API를 사용하여 역지오코딩
            const region = await reverseGeocode(location.latitude, location.longitude);

            if (region && region.sdName && region.wiwName) {
                console.log('선택한 위치의 행정구역:', region);

                // 해당 행정구역의 투표소 정보 가져오기
                await fetchPollingStations(region.sdName, region.wiwName);
            } else {
                console.error('행정구역 정보를 가져오는데 실패했습니다.');
                setError('행정구역 정보를 가져오는데 실패했습니다.');

                // 기본값으로 서울특별시 종로구 사용
                await fetchPollingStations("서울특별시", "종로구");
            }
        } catch (error) {
            console.error('위치 정보 처리 중 오류:', error);
            setError('위치 정보 처리 중 오류가 발생했습니다.');

            // 기본값으로 서울특별시 종로구 사용
            await fetchPollingStations("서울특별시", "종로구");
        } finally {
            setIsLoading(false);
        }
    }, [isDesktop, markers, reverseGeocode, fetchPollingStations]);

    // 컴포넌트 마운트 시 초기화
    useEffect(() => {

        // 네이버 지도 API가 로드되었는지 확인
        if (!window.naver || !window.naver.maps) {
            console.error('네이버 지도 API가 로드되지 않았습니다.');
            setError('지도를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
            return;
        }

        // 이미 지도가 초기화되었다면 다시 초기화하지 않음
        if (map) {
            return;
        }

        try {
            // 네이버 지도 초기화
            const container = document.getElementById('map');
            const options = {
                center: new window.naver.maps.LatLng(37.566826, 126.9786567), // 서울 시청
                zoom: 12,
                zoomControl: true,
                zoomControlOptions: {
                    position: window.naver.maps.Position.TOP_RIGHT
                }
            };

            // 지도 객체 생성
            const naverMap = new window.naver.maps.Map(container, options);
            setMap(naverMap);

            // 마커 객체 생성
            const locationMarker = new window.naver.maps.Marker({
                position: options.center,
                map: naverMap,
                visible: false
            });

            // 상태 한 번에 업데이트
            setMarkers([locationMarker]);

            // 위치 설정 로직 (모바일/데스크톱)
            if (isMobile) {
                console.log('모바일 디바이스 감지: 자동 위치 권한 요청');
                // 타이머로 약간 지연시켜 실행
                const timer = setTimeout(() => {
                    getCurrentLocation();
                }, 500);
                return () => clearTimeout(timer);
            } else {
                console.log('데스크톱 디바이스 감지: 지도 클릭 안내 표시');
                setShowInstruction(true);
                // 5초 후 안내 메시지 숨기기
                const timer = setTimeout(() => {
                    setShowInstruction(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        } catch (err) {
            setError('지도를 초기화하는 중 오류가 발생했습니다.');
        }


    }, [isMobile]);

    // 지도 객체가 생성된 후 이벤트 리스너 등록
    useEffect(()=> {
        if (map && isDesktop && !map._clickListenerAdded) {
            // 리스너가 한 번만 등록되도록 플래그 설정
            map._clickListenerAdded = true;

            let clickListener;

            // 네이버 지도 API의 이벤트 리스너 등록
            if (window.naver && window.naver.maps) {
                clickListener = window.naver.maps.Event.addListener(map, 'click', handleMapClick);
                console.log('지도 클릭 이벤트 리스너 등록');
            }

            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            return () => {
                // 안전 체크: naver 객체가 여전히 유효한지 확인
                if (window.naver && window.naver.maps && clickListener) {
                    window.naver.maps.Event.removeListener(clickListener);
                    map._clickListenerAdded = false;
                    console.log('지도 클릭 이벤트 리스너 제거');
                }
            };
        }
    },[map, isDesktop]);

    // 컴포넌트 마운트 시 API 데이터 가져오기
    useEffect(() => {
        // 최초 한 번만 실행되도록 설정
        const initialFetch = async () => {
            await fetchPollingStations("서울특별시", "종로구");
        };

        initialFetch();
    }, []); // fetchPollingStations 의존성 제거


    return (
        <Container isMobile={isMobile}>
            <Sidebar isMobile={isMobile}>
                <Title>투표소 찾기</Title>
                <SearchBox>
                    <SearchInput
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    ></SearchInput>
                </SearchBox>
                <LocationInfo>
                    <span>
                        {selectedLocation
                            ? `선택한 위치: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
                            : '위치를 선택해주세요'
                        }
                    </span>
                    <GetLocationButton onClick={getCurrentLocation} disabled={isLoading}>
                        {isLoading ? '로딩중...' : '내 위치 사용'}
                    </GetLocationButton>
                </LocationInfo>

                {error && <div style={{ padding: '1rem' }}>{error}</div>}


                <PollingStationList>
                    {stations.length > 0 ? (
                        stations.map(station => (
                            <PollingStationItem key={station.id}>
                                <h3>{station.name}</h3>
                                <p>{station.address}</p>
                                <p>거리 : {station.distanceText}</p>
                            </PollingStationItem>
                        ))
                    ) : (
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                            {selectedLocation
                                ? '주변에 투표소가 없습니다.'
                                : '위치를 선택하면 주변 투표소가 표시됩니다.'
                            }
                        </div>
                    )}
                </PollingStationList>
            </Sidebar>

            <MapContainer isMobile={isMobile} id="map">
                {/* 지도가 렌더링될 영역 */}
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '1rem',
                        borderRadius: '4px'
                    }}>
                        위치 정보를 불러오는 중...
                    </div>
                )}

                {/* PC에서 지도 클릭 안내 메시지 */}
                <InstructionMessage visible={showInstruction && isDesktop}>
                    지도를 클릭하여 위치를 선택하세요
                </InstructionMessage>
            </MapContainer>
        </Container>
    );
};

export default PollingStationFinder;