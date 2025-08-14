import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import BottomNavigationBar from "../components/BottomNavigationBar";
import styles from "./mypage.module.css";

const MyPage: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>마이 - Oddiya</title>
                <meta name="description" content="마이페이지" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.title}>마이</h1>
                    <p className={styles.subtitle}>
                        개인 정보 및 설정
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

export default MyPage;
