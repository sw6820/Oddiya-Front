import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles.module.css";

const navItems = [
    { label: "홈", path: "/" },
    { label: "계획하기", path: "/plan" },
    { label: "기록하기", path: "/record" },
    { label: "둘러보기", path: "/search" },
    { label: "마이", path: "/mypage" },
];

export default function BottomNavigationBar() {
    const router = useRouter();

    return (
        <nav className={styles.nav}>
            {navItems.map((item, idx) => {
                const isActive = item.path !== '#' && router.pathname === item.path;
                return (
                    <Link
                        key={idx}
                        href={item.path}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
