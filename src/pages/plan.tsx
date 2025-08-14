import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
// 드래그 앤 드롭을 위해 @hello-pangea/dnd 사용
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./plan.module.css";

declare global {
    interface Window {
        naver: any;
    }
}

// 중심을 위로 offset(위도 + offsetMeter)하는 함수
function getOffsetCenter(lat: number, lng: number, offsetMeter = 200) {
    // 위도 1도 ≈ 111,000m
    const offsetLat = lat + (offsetMeter / 111000);
    return { lat: offsetLat, lng };
}

// 중심점(centroid) 계산 함수
function getDayCenter(items: { lat: number; lng: number }[]): { lat: number; lng: number } {
    if (!items.length) return { lat: 37.5, lng: 127 };
    const lat = items.reduce((sum, i) => sum + i.lat, 0) / items.length;
    const lng = items.reduce((sum, i) => sum + i.lng, 0) / items.length;
    return { lat, lng };
}

// 일자별 더미 데이터 (city, cityLat, cityLng, 각 장소별 lat/lng 추가)
const initialPlans = [
    {
        city: "강릉",
        cityLat: 37.7519,
        cityLng: 128.8761,
        date: "2024.07.20",
        items: [
            { id: "1", title: "경포해변", lat: 37.8078, lng: 128.9065 },
            { id: "2", title: "안목해변 카페거리", lat: 37.7602, lng: 128.9462 },
            { id: "3", title: "초당순두부마을", lat: 37.7892, lng: 128.8995 },
        ],
    },
    {
        city: "강릉",
        cityLat: 37.7519,
        cityLng: 128.8761,
        date: "2024.07.21",
        items: [
            { id: "1", title: "정동 심곡 바다 부채길", lat: 37.6895, lng: 129.0346 },
            { id: "2", title: "오죽헌", lat: 37.7691, lng: 128.8711 },
            { id: "3", title: "중앙시장", lat: 37.7550, lng: 128.8962 },
        ],
    },
    {
        city: "강릉",
        cityLat: 37.7519,
        cityLng: 128.8761,
        date: "2024.07.22",
        items: [
            { id: "1", title: "주문진 수산시장", lat: 37.8895, lng: 128.8327 },
            { id: "2", title: "사천진 해변", lat: 37.8312, lng: 128.8751 },
        ],
    },
];
type DayPlan = typeof initialPlans[number];
type PlanItem = DayPlan["items"][number];

const NAVER_MAP_CLIENT_ID = "brxklqwku5";

// NaverMapBackground: center, markers, selectedMarker를 props로 받아 지도 표시
interface NaverMapBackgroundProps {
    center: { lat: number; lng: number };
    markers: { lat: number; lng: number; title: string; id: string }[];
    selectedMarkerId?: string;
    onMarkerClick?: (id: string) => void;
    zoom: number;
}

const NaverMapBackground: React.FC<NaverMapBackgroundProps> = ({ center, markers, selectedMarkerId, onMarkerClick, zoom }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstances = useRef<any[]>([]);

    // 지도 및 마커 렌더링
    useEffect(() => {
        if (!window.naver || !mapRef.current) return;
        if (!mapInstance.current) {
            mapInstance.current = new window.naver.maps.Map(mapRef.current, {
                center: new window.naver.maps.LatLng(center.lat, center.lng),
                zoom,
            });
        }
        // center/zoom 이동
        mapInstance.current.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
        mapInstance.current.setZoom(zoom);
        // 기존 마커 제거
        markerInstances.current.forEach((m) => m.setMap(null));
        markerInstances.current = markers.map((m) => {
            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(m.lat, m.lng),
                map: mapInstance.current,
                title: m.title,
                icon: m.id === selectedMarkerId ? {
                    content: `<div style='background:#4bb2ed;color:#fff;padding:4px 10px;border-radius:12px;font-size:13px;font-weight:600;'>${m.title}</div>`,
                    anchor: new window.naver.maps.Point(20, 20),
                } : undefined,
            });
            window.naver.maps.Event.addListener(marker, "click", () => {
                if (onMarkerClick) onMarkerClick(m.id);
            });
            return marker;
        });
    }, [center, markers, selectedMarkerId, onMarkerClick, zoom]);

    // 스크립트 로드
    useEffect(() => {
        if (window.naver) return;
        const script = document.createElement("script");
        script.id = "naver-map-script";
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
        script.async = true;
        script.onload = () => {
            if (mapRef.current) {
                mapInstance.current = new window.naver.maps.Map(mapRef.current, {
                    center: new window.naver.maps.LatLng(center.lat, center.lng),
                    zoom,
                });
            }
        };
        document.body.appendChild(script);
        return () => {
            // document.body.removeChild(script);
        };
    }, []);

    return (
        <div
            ref={mapRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                background: "#eee",
            }}
        />
    );
};

const Plan: NextPage = () => {
    const [plans, setPlans] = useState<DayPlan[]>(initialPlans);
    const [currentDay, setCurrentDay] = useState(0);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>(undefined);
    const [mapZoom, setMapZoom] = useState(12);

    // 드래그 앤 드롭: 해당 일차만
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const dayPlans = [...plans];
        const items = Array.from(dayPlans[currentDay].items);
        const [removed] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, removed);
        dayPlans[currentDay] = { ...dayPlans[currentDay], items };
        setPlans(dayPlans);
    };

    const canPrev = currentDay > 0;
    const canNext = currentDay < plans.length - 1;

    // 지도 center: 도시 중심 or 선택된 마커(위로 offset)
    const cityCenter = { lat: plans[currentDay].cityLat, lng: plans[currentDay].cityLng };
    const selectedItem = plans[currentDay].items.find((item) => item.id === selectedMarkerId);
    const dayCenter = getDayCenter(plans[currentDay].items);
    const mapCenter = selectedItem
        ? getOffsetCenter(selectedItem.lat, selectedItem.lng, -6000)
        : getOffsetCenter(dayCenter.lat, dayCenter.lng, -20000);
    const zoom = selectedItem ? 12 : 10;

    // 마커 목록
    const markers = plans[currentDay].items.map((item) => ({
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        title: item.title,
    }));

    // 카드 클릭 시 해당 위치로 지도 이동 + 확대
    const handleCardClick = (id: string) => {
        setSelectedMarkerId(id);
        setMapZoom(16);
    };

    // 마커 클릭 시에도 동일하게
    const handleMarkerClick = (id: string) => {
        setSelectedMarkerId(id);
        setMapZoom(16);
    };

    // 일차 바뀌면 마커 선택 해제, zoom 초기화
    useEffect(() => {
        setSelectedMarkerId(undefined);
        setMapZoom(12);
    }, [currentDay]);

    return (
        <div className={styles.container}>
            <Head>
                <title>여행 계획 - Oddiya</title>
                <meta name="description" content="여행 계획을 세워보세요" />
            </Head>

            <NaverMapBackground
                center={mapCenter}
                markers={markers}
                selectedMarkerId={selectedMarkerId}
                onMarkerClick={handleMarkerClick}
                zoom={zoom}
            />

            <div className={styles.bottomSheet}>
                <div className={styles.dayHeader}>
                    <div className={styles.dayLabels}>
                        <span className={styles.dayNumber}>{currentDay + 1}일차</span>
                        <span className={styles.dayDate}>{plans[currentDay].date}</span>
                    </div>
                    <div className={styles.dayNavigation}>
                        <button
                            className={styles.dayNavBtn}
                            onClick={() => canPrev && setCurrentDay((d) => d - 1)}
                            disabled={!canPrev}
                        >
                            ←
                        </button>
                        <button
                            className={styles.dayNavBtn}
                            onClick={() => canNext && setCurrentDay((d) => d + 1)}
                            disabled={!canNext}
                        >
                            →
                        </button>
                    </div>
                </div>
                <div className={styles.planContent}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="plan-list">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {plans[currentDay].items.length === 0 && (
                                        <div className={styles.emptyDay}>일정이 없습니다.</div>
                                    )}
                                    {plans[currentDay].items.map((plan, idx) => (
                                        <Draggable key={plan.id} draggableId={plan.id} index={idx}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`${styles.planCard} ${snapshot.isDragging ? styles.dragging : ""} ${selectedMarkerId === plan.id ? styles.selected : ""}`}
                                                    onClick={() => handleCardClick(plan.id)}
                                                >
                                                    <span className={styles.cardTitle}>{plan.title}</span>
                                                    <span className={styles.dragHandle}>≡</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            <BottomNavigationBar />
        </div>
    );
};

export default Plan;
