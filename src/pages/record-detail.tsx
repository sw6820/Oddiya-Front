import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Player } from "@remotion/player";
import { BeatVideo } from "../remotion/MyComp/BeatVideo";
import { Main } from "../remotion/MyComp/Main";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./record-detail.module.css";

// 더미 미디어 데이터
const initialMedia = [
    {
        id: 1,
        type: "photo",
        url: "https://picsum.photos/200/200?random=1",
        caption: "정동진 해변에서의 일출",
        date: "2024.01.15"
    },
    {
        id: 2,
        type: "photo",
        url: "https://picsum.photos/200/200?random=2",
        caption: "강릉 커피거리 산책",
        date: "2024.01.16"
    },
    {
        id: 3,
        type: "photo",
        url: "https://picsum.photos/200/200?random=3",
        caption: "오죽헌에서의 추억",
        date: "2024.01.17"
    }
];

export default function RecordDetail() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // record 객체가 없을 때를 대비한 기본값 설정
    const defaultRecord = {
        title: "여행 기록",
        date: "2024.01.15",
        location: "여행지",
        places: ["장소1", "장소2", "장소3"]
    };

    const record = router.query.record ?
        (() => {
            try {
                return JSON.parse(router.query.record as string);
            } catch (error) {
                console.error('record 파싱 에러:', error);
                return defaultRecord;
            }
        })()
        : defaultRecord;

    const [mediaItems, setMediaItems] = useState(initialMedia);
    const [selectedTab, setSelectedTab] = useState("all");
    const [isAddingMedia, setIsAddingMedia] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [addedCount, setAddedCount] = useState(0);



    // 필터링된 미디어
    const filteredMedia = selectedTab === "all"
        ? mediaItems
        : mediaItems.filter(item => item.type === selectedTab);

    // 선택된 사진들만 필터링 (사진 타입만)
    const selectedPhotos = mediaItems
        .filter(item => item.type === 'photo')
        .map(item => item.url);

    // 디버깅을 위한 useEffect
    useEffect(() => {
        console.log('=== 디버깅 정보 ===');
        console.log('record:', record);
        console.log('router.query:', router.query);
        console.log('mediaItems:', mediaItems);
        console.log('selectedPhotos:', selectedPhotos);
        console.log('selectedPhotos.length:', selectedPhotos.length);

        if (selectedPhotos.length > 0) {
            console.log('첫 번째 이미지 URL:', selectedPhotos[0]);
            console.log('이미지 URL 타입:', typeof selectedPhotos[0]);

            // 이미지가 제대로 로드되는지 테스트
            const testImg = new Image();
            testImg.onload = () => console.log('✅ 이미지 로드 성공:', selectedPhotos[0]);
            testImg.onerror = () => console.error('❌ 이미지 로드 실패:', selectedPhotos[0]);
            testImg.src = selectedPhotos[0];
        } else {
            console.log('⚠️ selectedPhotos가 비어있음');
        }
    }, [record, router.query, selectedPhotos, mediaItems]);

    // 파일 추가 처리
    const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newMedia: Array<{
                id: number;
                type: 'photo' | 'video';
                url: string;
                caption: string;
                date: string;
            }> = [];

            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            newMedia.push({
                                id: Date.now() + index,
                                type: 'photo',
                                url: e.target.result as string,
                                caption: '',
                                date: new Date().toLocaleDateString()
                            });

                            if (newMedia.length === files.length) {
                                setMediaItems(prev => [...prev, ...newMedia]);
                                setAddedCount(files.length);
                                setShowSuccessMessage(true);
                                setIsAddingMedia(false);

                                // 3초 후 성공 메시지 숨기기
                                setTimeout(() => {
                                    setShowSuccessMessage(false);
                                }, 3000);
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                } else if (file.type.startsWith('video/')) {
                    newMedia.push({
                        id: Date.now() + index,
                        type: 'video',
                        url: URL.createObjectURL(file),
                        caption: '',
                        date: new Date().toLocaleDateString()
                    });

                    if (newMedia.length === files.length) {
                        setMediaItems(prev => [...prev, ...newMedia]);
                        setAddedCount(files.length);
                        setShowSuccessMessage(true);
                        setIsAddingMedia(false);
                    }
                }
            });
        }
    };

    // 미디어 삭제
    const handleDeleteMedia = (id: number) => {
        setMediaItems(prev => prev.filter(item => item.id !== id));
    };

    // 미디어 편집
    const handleEditCaption = (id: number, newCaption: string) => {
        setMediaItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, caption: newCaption } : item
            )
        );
    };

    // 숏츠 생성 시작 - 바로 create-video 페이지로 이동
    const handleCreateShorts = () => {
        if (selectedPhotos.length === 0) {
            alert("사진을 먼저 추가해주세요.");
            return;
        }

        // 바로 create-video 페이지로 이동
        router.push({
            pathname: '/create-video',
            query: {
                photos: JSON.stringify(selectedPhotos),
                title: record.title
            }
        });
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${record.title} - 여행 기록 - Oddiya`}</title>
                <meta name="description" content={`${record.title} 여행 기록`} />
            </Head>

            {/* 헤더 */}
            <div className={styles.recordDetailHeader}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ←
                </button>
                <div className={styles.headerInfo}>
                    <h1>{record.title}</h1>
                    <p className={styles.recordDate}>{record.date}</p>
                </div>
                <button
                    className={styles.addMediaBtn}
                    onClick={() => setIsAddingMedia(true)}
                >
                    +
                </button>
            </div>

            {/* 여행 정보 요약 */}
            <div className={styles.tripSummary}>
                <div className={styles.summaryCard}>
                    <div className={styles.locationInfo}>
                        <span className={styles.locationIcon}>📍</span>
                        <span className={styles.locationText}>{record.location}</span>
                    </div>
                    <div className={styles.placesInfo}>
                        <h3>방문 장소</h3>
                        <div className={styles.placesList}>
                            {record.places.map((place: string, index: number) => (
                                <span key={index} className={styles.placeTag}>{place}</span>
                            ))}
                        </div>
                    </div>
                    <div className={styles.mediaSummary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryIcon}>📷</span>
                            <span>{mediaItems.filter(item => item.type === 'photo').length}장</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryIcon}>🎥</span>
                            <span>{mediaItems.filter(item => item.type === 'video').length}개</span>
                        </div>
                    </div>

                    {/* 숏츠 생성 버튼 */}
                    <button
                        onClick={handleCreateShorts}
                        className={styles.createShortsBtn}
                        disabled={selectedPhotos.length === 0}
                        title={selectedPhotos.length === 0 ? "사진을 먼저 추가해주세요" : "숏츠 생성하기"}
                        style={{
                            background: selectedPhotos.length === 0 ? '#ccc' : '#4BB2ED',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: selectedPhotos.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            boxShadow: selectedPhotos.length === 0 ? 'none' : '0 4px 20px rgba(75, 178, 237, 0.3)',
                            transform: selectedPhotos.length === 0 ? 'none' : 'translateY(0)'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedPhotos.length > 0) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(75, 178, 237, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedPhotos.length > 0) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(75, 178, 237, 0.3)';
                            }
                        }}
                    >
                        <span className={styles.shortsIcon}>🎬</span>
                        <span>
                            {selectedPhotos.length === 0
                                ? `사진 추가 후 숏츠 생성 (${selectedPhotos.length}장)`
                                : `숏츠 생성하기 (${selectedPhotos.length}장)`
                            }
                        </span>
                    </button>
                </div>
            </div>

            {/* 미디어 추가 모달 */}
            {isAddingMedia && (
                <div className={styles.addMediaModal}>
                    <div className={styles.modalContent}>
                        <h3>미디어 추가</h3>
                        <p className={styles.modalDescription}>
                            여러 장의 사진이나 동영상을 한번에 선택할 수 있습니다
                        </p>
                        <div className={styles.addOptions}>
                            <button
                                className={styles.addOption}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span className={styles.optionIcon}>📷</span>
                                <span>사진/동영상 추가</span>
                            </button>
                        </div>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => setIsAddingMedia(false)}
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}





            {/* 성공 메시지 */}
            {showSuccessMessage && (
                <div className={styles.successMessage}>
                    {addedCount}개의 미디어가 추가되었습니다! 📸
                </div>
            )}

            {/* 숨겨진 파일 입력 */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileAdd}
                style={{ display: 'none' }}
            />

            {/* 미디어 필터 탭 */}
            <div className={styles.mediaFilterTabs}>
                <button
                    className={`${styles.filterTab} ${selectedTab === 'all' ? styles.active : ''}`}
                    onClick={() => setSelectedTab('all')}
                >
                    전체
                </button>
                <button
                    className={`${styles.filterTab} ${selectedTab === 'photo' ? styles.active : ''}`}
                    onClick={() => setSelectedTab('photo')}
                >
                    사진
                </button>
                <button
                    className={`${styles.filterTab} ${selectedTab === 'video' ? styles.active : ''}`}
                    onClick={() => setSelectedTab('video')}
                >
                    동영상
                </button>
            </div>

            {/* 미디어 그리드 */}
            {filteredMedia.length > 0 ? (
                <div className={styles.mediaGrid}>
                    {filteredMedia.map((item) => (
                        <div key={item.id} className={styles.mediaItem}>
                            {item.type === 'photo' ? (
                                <img
                                    src={item.url}
                                    alt={item.caption || `미디어 ${item.id}`}
                                    className={styles.mediaImage}
                                />
                            ) : (
                                <div className={styles.videoContainer}>
                                    <video
                                        src={item.url}
                                        controls
                                        className={styles.mediaVideo}
                                    />
                                </div>
                            )}
                            <div className={styles.mediaInfo}>
                                <p className={styles.mediaCaption}>{item.caption}</p>
                                <p className={styles.mediaDate}>{item.date}</p>
                            </div>
                            <div className={styles.mediaActions}>
                                {/* <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        const newCaption = prompt('캡션을 입력하세요:', item.caption);
                                        if (newCaption !== null) {
                                            handleEditCaption(item.id, newCaption);
                                        }
                                    }}
                                >
                                    ✏️
                                </button> */}
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteMedia(item.id)}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className={styles.emptyMediaState}
                    onClick={() => setIsAddingMedia(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '16px',
                        border: '2px dashed #4BB2ED',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3a9fd8';
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#4BB2ED';
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📸</div>
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            color: '#333',
                            margin: '0 0 12px 0'
                        }}>
                            아직 미디어가 없습니다
                        </h3>
                        <p style={{
                            fontSize: '1rem',
                            color: '#666',
                            margin: '0 0 24px 0',
                            lineHeight: '1.5'
                        }}>
                            사진이나 동영상을 추가해보세요
                        </p>
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#4BB2ED',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            💡 클릭하여 미디어 추가하기
                        </div>
                    </div>
                </div>
            )}

            <BottomNavigationBar />
        </div>
    );
}
