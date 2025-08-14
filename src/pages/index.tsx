import React, { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./index.module.css";

const Home: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDateField, setShowDateField] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results page with the query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleExploreClick = () => {
    // Navigate to the explore/recommendation page
    router.push("/search");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        // 엔터를 눌렀을 때도 날짜 선택 필드 표시
        setSelectedDestination(searchQuery.trim());
        setShowDateField(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleDateSubmit = () => {
    if (startDate && endDate && selectedDestination) {
      // 여행 계획 페이지로 이동
      router.push({
        pathname: '/travel-plan',
        query: {
          destination: selectedDestination,
          startDate: startDate,
          endDate: endDate
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>아이의 시선에서 추억을 완성하는 여행 - Oddiya</title>
        <meta name="description" content="여행의 여운을 오래 남도록 오디야를 해보세요" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.content}>
          {/* Main Title Section */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <span className={styles.titleLine1}>아이의 시선에서</span>
              <span className={styles.titleLine2}>추억을 완성하는 여행</span>
            </h1>
            <p className={styles.subtitle}>
              여행의 여운을 오래 남도록 오디야를 해보세요
            </p>
          </div>

          {/* Search Section */}
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <div className={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder="어디로 떠나시나요?"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={styles.searchInput}
              />
            </div>

            {/* Date Selection Fields */}
            {showDateField && (
              <div className={styles.dateSection}>
                <div className={styles.dateFields}>
                  <div className={styles.dateField}>
                    <label className={styles.dateLabel}>시작일</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={styles.dateInput}
                    />
                  </div>
                  <div className={styles.dateField}>
                    <label className={styles.dateLabel}>종료일</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={styles.dateInput}
                    />
                  </div>
                </div>
                <button
                  onClick={handleDateSubmit}
                  className={styles.dateSubmitButton}
                  disabled={!startDate || !endDate}
                >
                  여행 계획 만들기
                </button>
              </div>
            )}

            {/* Content Search Link */}
            <div className={styles.contentSearchLink}>
              <button
                onClick={handleExploreClick}
                className={styles.contentSearchButton}
              >
                여행지를 고르지 못하셨나요?
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigationBar />
    </div>
  );
};

export default Home;
