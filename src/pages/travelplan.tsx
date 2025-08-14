import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./travelplan.module.css";

const TravelPlan: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>계획하기 - Oddiya</title>
                <meta name="description" content="여행 계획 세우기" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.title}>계획하기</h1>
                    <p className={styles.subtitle}>
                        여행 계획을 세워보세요
                    </p>
                    <div className={styles.placeholder}>
                        <p>이 페이지는 개발 중입니다.</p>
                        <p>곧 더 많은 기능을 제공할 예정입니다.</p>
                    </div>
                </div>
            </main>

            <BottomNavigationBar />
        </div>
    );
};

export default TravelPlan;
