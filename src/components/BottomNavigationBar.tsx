import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

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
        <nav
            style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                background: "#fff",
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                zIndex: 100,
                fontFamily: 'Pretendard, sans-serif',
                boxSizing: 'border-box',
            }}
        >
            {navItems.map((item, idx) => {
                const isActive = item.path !== '#' && router.pathname === item.path;
                return (
                    <Link
                        key={idx}
                        href={item.path}
                        style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: 13,
                            color: isActive ? "#4BB2ED" : "#222",
                            fontWeight: isActive ? 700 : 500,
                            cursor: item.path !== '#' ? "pointer" : "default",
                            padding: "0 2px",
                            borderTop: isActive ? '2.5px solid #4BB2ED' : '2.5px solid transparent',
                            transition: 'color 0.2s, border-top 0.2s',
                            background: 'none',
                            height: 56,
                            lineHeight: '56px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
