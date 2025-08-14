import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./travel-plan.module.css";

// API response structure
interface TravelDestination {
    id: number;
    imgURL: string;
    title: string;
    location: string;
    description: string;
    tags: string[];
}

interface TravelPlanData {
    destination: string;
    startDate: string;
    endDate: string;
    destinations: TravelDestination[];
}

const TravelPlan: NextPage = () => {
    const router = useRouter();
    const [travelData, setTravelData] = useState<TravelPlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    useEffect(() => {
        // URL에서 여행 정보 가져오기
        const { destination, startDate, endDate } = router.query;

        if (destination && startDate && endDate) {
            fetchTravelDestinations(destination as string, startDate as string, endDate as string);
        } else {
            setError("여행 정보가 없습니다.");
            setLoading(false);
        }
    }, [router.query]);

    const fetchTravelDestinations = async (destination: string, startDate: string, endDate: string) => {
        try {
            setLoading(true);

            // 실제 API 호출
            const response = await fetch(`/api/travel-photos?destination=${encodeURIComponent(destination)}&startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();

            if (data.success && data.data) {
                setTravelData({
                    destination,
                    startDate,
                    endDate,
                    destinations: data.data
                });
            } else {
                setError(data.error || "데이터를 불러오는데 실패했습니다.");
            }
        } catch (err) {
            setError("사진을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const toggleSelection = (id: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const goToPlanPage = () => {
        if (selectedItems.size > 0) {
            const selectedDestinations = Array.from(selectedItems).map(id =>
                travelData?.destinations.find(d => d.id === id)
            ).filter(Boolean);

            router.push({
                pathname: '/plan',
                query: {
                    selectedItems: JSON.stringify(selectedDestinations),
                    destination: travelData?.destination,
                    startDate: travelData?.startDate,
                    endDate: travelData?.endDate
                }
            });
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Head>
                    <title>여행 계획 생성 중 - Oddiya</title>
                </Head>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>여행 계획을 생성하고 있습니다...</p>
                </div>
                <BottomNavigationBar />
            </div>
        );
    }

    if (error || !travelData) {
        return (
            <div className={styles.container}>
                <Head>
                    <title>오류 - Oddiya</title>
                </Head>
                <div className={styles.errorContainer}>
                    <p>{error || "알 수 없는 오류가 발생했습니다."}</p>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        뒤로 가기
                    </button>
                </div>
                <BottomNavigationBar />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{travelData.destination} 여행 계획 - Oddiya</title>
                <meta name="description" content={`${travelData.destination} 여행 계획 및 추천 사진`} />
            </Head>

            <main className={styles.main}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <button onClick={() => router.back()} className={styles.backButton}>
                            ←
                        </button>
                        <div className={styles.travelInfo}>
                            <h1 className={styles.destination}>{travelData.destination}</h1>
                            <div className={styles.dateInfo}>
                                {formatDate(travelData.startDate)} - {formatDate(travelData.endDate)}
                            </div>
                        </div>
                        <button className={styles.shareButton}>
                            ☁️
                        </button>
                    </div>
                </div>

                {/* Selection Counter and Plan Button */}
                {selectedItems.size > 0 && (
                    <div className={styles.selectionBar}>
                        <div className={styles.selectionInfo}>
                            <span className={styles.selectionCount}>{selectedItems.size}개 선택됨</span>
                        </div>
                        <button onClick={goToPlanPage} className={styles.planButton}>
                            계획하기 ({selectedItems.size})
                        </button>
                    </div>
                )}

                {/* Photo Gallery */}
                <div className={styles.photoGallery}>
                    {travelData.destinations.map((destination) => (
                        <div key={destination.id} className={styles.photoItem}>
                            <div className={styles.photoContainer}>
                                <img
                                    src={destination.imgURL}
                                    alt={destination.title}
                                    className={styles.photo}
                                />

                                {/* Selection Button */}
                                <button
                                    className={`${styles.selectButton} ${selectedItems.has(destination.id) ? styles.selected : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelection(destination.id);
                                    }}
                                >
                                    {selectedItems.has(destination.id) ? '✓' : '+'}
                                </button>

                                <div className={styles.photoOverlay}>
                                    <h3 className={styles.photoTitle}>{destination.title}</h3>
                                    <p className={styles.photoDescription}>{destination.description}</p>
                                    <div className={styles.photoTags}>
                                        {destination.tags.map((tag, index) => (
                                            <span key={index} className={styles.tag}>
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNavigationBar />
        </div>
    );
};

export default TravelPlan;
