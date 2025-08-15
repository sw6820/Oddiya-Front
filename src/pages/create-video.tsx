import { Player } from "@remotion/player";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Main } from "../remotion/MyComp/Main";
import { BeatVideo } from "../remotion/MyComp/BeatVideo";
import {
    CompositionProps,
    defaultMyCompProps,
    DURATION_IN_FRAMES,
    VIDEO_FPS,
    VIDEO_HEIGHT,
    VIDEO_WIDTH,
} from "../../types/constants";
import { z } from "zod";
import { RenderControls } from "../components/RenderControls";
import { Tips } from "../components/Tips/Tips";
import { Spacing } from "../components/Spacing";
import { Input } from "../components/Input";
import BottomNavigationBar from "../components/BottomNavigationBar";

const container: React.CSSProperties = {
    maxWidth: 1200,
    margin: "auto",
    marginBottom: 20,
    padding: "0 20px",
    fontFamily: "'Pretendard', sans-serif",
};

const outer: React.CSSProperties = {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(75, 178, 237, 0.2)",
    marginBottom: 40,
    marginTop: 60,
};

const player: React.CSSProperties = {
    width: "100%",
};

const section: React.CSSProperties = {
    marginBottom: "40px",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f0f0f0",
};

const CreateVideo: NextPage = () => {
    const router = useRouter();
    const [text, setText] = useState<string>(defaultMyCompProps.title);
    const [images, setImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [musicFile, setMusicFile] = useState<string | null>(null);

    // URL 쿼리 파라미터에서 이미지와 제목 자동 로드
    useEffect(() => {
        if (router.query.photos && router.query.title) {
            try {
                const photosFromQuery = JSON.parse(router.query.photos as string);
                const titleFromQuery = router.query.title as string;

                if (Array.isArray(photosFromQuery) && photosFromQuery.length > 0) {
                    setImages(photosFromQuery);
                    setText(titleFromQuery);
                    console.log('URL에서 이미지와 제목 로드됨:', { photos: photosFromQuery, title: titleFromQuery });
                }
            } catch (error) {
                console.error('URL 파라미터 파싱 에러:', error);
            }
        }
    }, [router.query]);

    const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
        return {
            title: text,
            images: images,
            music: musicFile || undefined,
        };
    }, [text, images, musicFile]);

    const removeImage = useCallback((index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleMusicUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setMusicFile(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const generateVideo = useCallback(async () => {
        if (images.length === 0) {
            alert("최소 한 개의 이미지를 추가해주세요.");
            return;
        }

        setIsGenerating(true);
        try {
            // Use backend API server
            const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            
            console.log('Video generation request:', {
                apiUrl: backendApiUrl,
                title: text,
                imageCount: images.length
            });
            
            // Call backend video render endpoint
            const response = await fetch(`${backendApiUrl}/v1/video/render`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: text,
                    images: images,
                    music: musicFile || null,
                    duration: 15, // seconds
                    format: 'mp4'
                })
            });
            
            // Uncomment this when HTTPS is configured:
            // const response = await fetch(`${videoApiUrl}/api/lambda/render`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({
            //         id: "BeatVideo",
            //         inputProps: {
            //             title: text,
            //             images: images,
            //             music: musicFile || undefined,
            //         },
            //     }),
            // });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: "Unknown error" }));
                throw new Error(error.message || "렌더링 요청에 실패했습니다.");
            }

            const result = await response.json();
            console.log("렌더링 결과:", result);

            // Download the generated video
            if (result.downloadUrl) {
                // Use backend download endpoint
                const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const downloadUrl = `${backendApiUrl}${result.downloadUrl}`;
                
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `oddiya-video-${result.renderId || Date.now()}.mp4`;
                link.target = "_blank"; // Open in new tab to trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (result.outputUrl) {
                // Fallback to direct URL if provided
                const link = document.createElement("a");
                link.href = result.outputUrl;
                link.download = "video.mp4";
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            alert("비디오가 성공적으로 생성되었습니다!");
        } catch (error) {
            console.error("비디오 생성 실패:", error);
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            alert("비디오 생성에 실패했습니다: " + errorMessage);
        } finally {
            setIsGenerating(false);
        }
    }, [text, images]);

    return (
        <div>
            <Head>
                <title>비디오 생성 - Remotion and Next.js</title>
                <meta name="description" content="사진으로 비디오 만들기" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div style={container}>
                {/* 사진 슬라이드 */}
                {images.length > 0 && (
                    <div style={{
                        marginBottom: "40px",
                        padding: "20px",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #f0f0f0"
                    }}>
                        <h3 style={{
                            margin: "0 0 20px 0",
                            color: "#333",
                            fontSize: "1.2rem",
                            fontWeight: "600"
                        }}>
                            선택된 사진 ({images.length}장)
                        </h3>
                        <div style={{
                            display: "flex",
                            gap: "12px",
                            overflowX: "auto",
                            padding: "8px 0",
                            scrollbarWidth: "thin",
                            scrollbarColor: "#4BB2ED #f0f0f0"
                        }}>
                            {images.map((image, index) => (
                                <div key={index} style={{
                                    position: "relative",
                                    flexShrink: 0
                                }}>
                                    <img
                                        src={image}
                                        alt={`이미지 ${index + 1}`}
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "cover",
                                            borderRadius: "12px",
                                            border: "2px solid #4BB2ED"
                                        }}
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            background: "rgba(255, 0, 0, 0.8)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "24px",
                                            height: "24px",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        title="삭제"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 미리보기 섹션 */}
                <div style={section}>
                    <h2>미리보기</h2>
                    <div style={outer}>
                        <Player
                            component={BeatVideo}
                            inputProps={inputProps}
                            durationInFrames={450}
                            fps={30}
                            compositionHeight={1920}
                            compositionWidth={1080}
                            style={player}
                            controls
                            autoPlay
                            loop
                        />
                    </div>
                </div>

                {/* 설정 섹션들 */}
                {/* 음악 업로드 섹션 */}
                <div style={section}>
                    <h2>배경 음악 추가 (선택사항)</h2>
                    <div style={{ marginBottom: "20px" }}>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleMusicUpload}
                            style={{ marginBottom: "10px" }}
                        />
                        {musicFile && (
                            <div style={{ color: "green", fontSize: "14px" }}>
                                ✓ 음악 파일이 업로드되었습니다
                            </div>
                        )}
                        <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                            음악 파일을 추가하면 비트에 맞춰 이미지가 표시됩니다.
                            음악이 없어도 기본 비트로 작동합니다.
                        </p>
                    </div>
                </div>

                {/* 비디오 제목 설정 섹션 */}
                <div style={section}>
                    <h2>비디오 제목 설정</h2>
                    <Input
                        text={text}
                        setText={setText}
                        disabled={false}
                        placeholder="비디오 제목을 입력하세요"
                    />
                </div>

                {/* 비디오 생성 섹션 */}
                <div style={section}>
                    <h2>6. 비디오 생성</h2>
                    <button
                        onClick={generateVideo}
                        disabled={isGenerating || images.length === 0}
                        style={{
                            background: isGenerating || images.length === 0 ? '#ccc' : '#4BB2ED',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isGenerating || images.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isGenerating || images.length === 0 ? 'none' : '0 4px 20px rgba(75, 178, 237, 0.3)',
                            transform: isGenerating || images.length === 0 ? 'none' : 'translateY(0)',
                            width: '100%',
                            maxWidth: '300px'
                        }}
                        onMouseEnter={(e) => {
                            if (!isGenerating && images.length > 0) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(75, 178, 237, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isGenerating && images.length > 0) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(75, 178, 237, 0.3)';
                            }
                        }}
                    >
                        {isGenerating ? "비디오 생성 중..." : "🎬 비디오 생성하기"}
                    </button>
                </div>

                <Spacing />
                <Tips />

                <BottomNavigationBar />
            </div>
        </div>
    );
};

export default CreateVideo; 