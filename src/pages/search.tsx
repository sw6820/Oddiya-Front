import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./search.module.css";

// Mock data for travel destinations
const mockDestinations = [
    {
        id: 1,
        name: "제주도",
        category: "국내여행",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "한국의 아름다운 섬, 자연과 문화를 동시에 즐길 수 있는 곳"
    },
    {
        id: 2,
        name: "부산",
        category: "국내여행",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "바다와 도시가 만나는 활기찬 항구도시"
    },
    {
        id: 3,
        name: "도쿄",
        category: "해외여행",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "현대와 전통이 공존하는 일본의 수도"
    },
    {
        id: 4,
        name: "파리",
        category: "해외여행",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "예술과 로맨스의 도시, 에펠탑이 있는 곳"
    },
    {
        id: 5,
        name: "뉴욕",
        category: "해외여행",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "세계의 중심, 자유의 여신상이 있는 도시"
    },
    {
        id: 6,
        name: "강릉",
        category: "국내여행",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "아름다운 해안선과 커피거리가 있는 문화도시"
    }
];

const Search: NextPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDestinations, setFilteredDestinations] = useState(mockDestinations);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const router = useRouter();

    useEffect(() => {
        // Get search query from URL if present
        const { q } = router.query;
        if (q && typeof q === "string") {
            setSearchQuery(q);
            filterDestinations(q, selectedCategory);
        }
    }, [router.query]);

    const filterDestinations = (query: string, category: string) => {
        let filtered = mockDestinations;

        if (query.trim()) {
            filtered = filtered.filter(dest =>
                dest.name.toLowerCase().includes(query.toLowerCase()) ||
                dest.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (category !== "전체") {
            filtered = filtered.filter(dest => dest.category === category);
        }

        setFilteredDestinations(filtered);
    };

    const handleSearch = () => {
        filterDestinations(searchQuery, selectedCategory);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        filterDestinations(searchQuery, category);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const categories = ["전체", "국내여행", "해외여행"];

    return (
        <div className={styles.container}>
            <Head>
                <title>여행지 검색 및 추천 - Oddiya</title>
                <meta name="description" content="여행지 검색 및 추천 서비스" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>둘러보기</h1>
                    <p className={styles.subtitle}>
                        {searchQuery ? `"${searchQuery}" 검색 결과` : "추천 여행지를 둘러보세요"}
                    </p>
                </div>

                <div className={styles.searchSection}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="여행하고 싶은 곳을 검색해보세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={styles.searchInput}
                        />
                        <button
                            onClick={handleSearch}
                            className={styles.searchButton}
                        >
                            검색
                        </button>
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <div className={styles.categoryButtons}>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ""
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.resultsSection}>
                    {filteredDestinations.length > 0 ? (
                        <div className={styles.destinationsGrid}>
                            {filteredDestinations.map((destination) => (
                                <div key={destination.id} className={styles.destinationCard}>
                                    <div className={styles.cardImage}>
                                        <img
                                            src={destination.image}
                                            alt={destination.name}
                                            className={styles.image}
                                        />
                                        <span className={styles.category}>{destination.category}</span>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.destinationName}>{destination.name}</h3>
                                        <p className={styles.destinationDescription}>
                                            {destination.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <p>검색 결과가 없습니다.</p>
                            <p>다른 키워드로 검색해보세요.</p>
                        </div>
                    )}
                </div>
            </main>

            <BottomNavigationBar />
        </div>
    );
};

export default Search;
