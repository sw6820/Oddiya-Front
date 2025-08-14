import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./record.module.css";

// 더미 데이터 - 완료된 여행 기록들
const recordData = [
    {
        id: 1,
        title: "강릉 여행",
        date: "2024.01.15 - 2024.01.17",
        location: "강릉",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500",
        places: ["정동진 해변", "강릉 커피거리", "오죽헌", "경포대"],
        status: "completed",
        photos: 24,
        videos: 3
    },
    {
        id: 2,
        title: "부산 여행",
        date: "2024.01.10 - 2024.01.12",
        location: "부산",
        thumbnail: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500",
        places: ["해운대 해수욕장", "감천문화마을", "부산타워", "국제시장"],
        status: "completed",
        photos: 18,
        videos: 2
    },
    {
        id: 3,
        title: "제주도 여행",
        date: "2024.01.05 - 2024.01.08",
        location: "제주",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        places: ["성산일출봉", "만장굴", "천지연폭포", "한라산"],
        status: "completed",
        photos: 32,
        videos: 5
    },
    {
        id: 4,
        title: "서울 여행",
        date: "2023.12.20 - 2023.12.22",
        location: "서울",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
        places: ["경복궁", "남산타워", "홍대거리", "명동"],
        status: "completed",
        photos: 28,
        videos: 4
    }
];

export default function Record() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState("all");

    // 필터링된 기록 데이터
    const filteredRecords = selectedFilter === "all"
        ? recordData
        : recordData.filter(record => record.status === selectedFilter);

    // 기록 상세 페이지로 이동
    const handleRecordClick = (record: typeof recordData[0]) => {
        router.push({
            pathname: '/record-detail',
            query: { record: JSON.stringify(record) }
        });
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>여행 기록 - Oddiya</title>
                <meta name="description" content="완료된 여행들의 추억을 확인해보세요" />
            </Head>

            {/* 헤더 */}
            <div className={styles.recordHeader}>
                <h1>여행 기록</h1>
                <p className={styles.subtitle}>완료된 여행들의 추억을 확인해보세요</p>
            </div>

            {/* 필터 탭 */}
            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${selectedFilter === "all" ? styles.active : ""}`}
                    onClick={() => setSelectedFilter("all")}
                >
                    전체 ({recordData.length})
                </button>
                <button
                    className={`${styles.filterTab} ${selectedFilter === "completed" ? styles.active : ""}`}
                    onClick={() => setSelectedFilter("completed")}
                >
                    완료된 여행 ({recordData.filter(r => r.status === "completed").length})
                </button>
            </div>

            {/* 기록 목록 */}
            <div className={styles.recordsList}>
                {filteredRecords.map((record) => (
                    <div
                        key={record.id}
                        className={styles.recordCard}
                        onClick={() => handleRecordClick(record)}
                    >
                        <div className={styles.recordImage}>
                            <img src={record.thumbnail} alt={record.title} />
                            <div className={styles.recordOverlay}>
                                <div className={styles.recordStatus}>
                                    {record.status === "completed" && (
                                        <span className={styles.statusBadge}>완료</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.recordInfo}>
                            <div className={styles.recordHeaderInfo}>
                                <h3>{record.title}</h3>
                                <span className={styles.recordDate}>{record.date}</span>
                            </div>

                            <div className={styles.recordLocation}>
                                <span className={styles.locationIcon}>📍</span>
                                <span>{record.location}</span>
                            </div>

                            <div className={styles.recordPlaces}>
                                <p>방문 장소: {record.places.slice(0, 3).join(", ")}
                                    {record.places.length > 3 && ` +${record.places.length - 3}곳`}
                                </p>
                            </div>

                            <div className={styles.recordMedia}>
                                <div className={styles.mediaItem}>
                                    <span className={styles.mediaIcon}>📷</span>
                                    <span>{record.photos}장</span>
                                </div>
                                <div className={styles.mediaItem}>
                                    <span className={styles.mediaIcon}>🎥</span>
                                    <span>{record.videos}개</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 빈 상태 */}
            {filteredRecords.length === 0 && (
                <div
                    className={styles.emptyState}
                    onClick={() => router.push('/create-video')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.emptyIcon}>📝</div>
                    <h3>아직 완료된 여행이 없어요</h3>
                    <p>여행을 계획하고 완료하면 여기에 기록이 나타납니다</p>
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#f0f8ff',
                        borderRadius: '12px',
                        border: '2px dashed #4BB2ED',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            margin: '0 0 12px 0',
                            color: '#4BB2ED',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            💡 빠른 시작
                        </p>
                        <p style={{
                            margin: '0',
                            color: '#666',
                            fontSize: '13px',
                            lineHeight: '1.4'
                        }}>
                            클릭하여 사진으로 여행 기록 만들기
                        </p>
                    </div>
                </div>
            )}

            {/* 새로운 여행 기록 추가 버튼 */}
            <div style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                zIndex: 100
            }}>
                <button
                    onClick={() => router.push('/create-video')}
                    style={{
                        background: '#4BB2ED',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(75, 178, 237, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(75, 178, 237, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(75, 178, 237, 0.3)';
                    }}
                    title="새 여행 기록 추가"
                >
                    +
                </button>
            </div>

            <BottomNavigationBar />
        </div>
    );
}
