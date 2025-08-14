import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { useMemo } from 'react';
import { z } from "zod";
import { CompositionProps } from "../../../types/constants";

const timingData = {
    beat_times: [
        0.05,
        0.45,
        0.87,
        1.7,
        2.1,
        2.94,
        3.36,
        4.18,
        4.6,
        5.42,
        5.83,
        6.66,
        7.08,
        7.91,
        8.31,
        8.73,
        9.56,
        9.97,
        10.8,
        11.22,
        12.04,
        12.46,
        13.28,
        13.7,
        14.52,
        14.98,
        15.87
    ],
};

const singleBeatIndices = new Set([0, 4, 9, 14, 15, 18, 21, 26, 27,]);

function getSeededRandomInt(seed: number, min: number, max: number) {
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(min + rand * (max - min + 1));
}

function decideLayoutType(seed: number, last: string | null): 'grid' | 'coords' {
    const candidate = getSeededRandomInt(seed, 0, 1) === 0 ? 'grid' : 'coords';
    return candidate === last ? (candidate === 'grid' ? 'coords' : 'grid') : candidate;
}

export const BeatVideo = ({ title, images = [], music }: z.infer<typeof CompositionProps>) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const renderItems = useMemo(() => {
        if (!images || images.length === 0) return [];

        let lastLayout: 'grid' | 'coords' | null = null;
        const items: Array<{
            groupIndex: number;
            layout: 'single' | 'gridImage' | 'coordsImage';
            imgIndex: number;
            coordsPos?: { left: number; top: number; widthPercent: number };
            gridIdx?: number;
            zIndex: number;
            startFrame: number;
        }> = [];

        let beatIdx = 0;
        while (beatIdx < timingData.beat_times.length) {
            const groupIndex = beatIdx;
            let layoutType: 'single' | 'grid' | 'coords';
            if (singleBeatIndices.has(groupIndex)) {
                layoutType = 'single';
            } else {
                layoutType = decideLayoutType(groupIndex * 99, lastLayout);
            }

            if (layoutType !== 'single') lastLayout = layoutType;

            const startFrame = Math.floor(timingData.beat_times[beatIdx] * fps);

            if (layoutType === 'single') {
                items.push({
                    groupIndex,
                    layout: 'single',
                    imgIndex: groupIndex % images.length,
                    zIndex: groupIndex,
                    startFrame,
                });
                beatIdx += 1;
                continue;
            }

            if (layoutType === 'grid') {
                const count = 4;
                for (let i = 0; i < count; i++) {
                    if (beatIdx + i >= timingData.beat_times.length) break;
                    items.push({
                        groupIndex,
                        layout: 'gridImage',
                        imgIndex: (groupIndex + i) % images.length,
                        zIndex: groupIndex,
                        startFrame: Math.floor(timingData.beat_times[beatIdx + i] * fps),
                        gridIdx: i,
                    });
                }
                beatIdx += count;
                continue;
            }

            // coords layout
            const count = getSeededRandomInt(groupIndex * 123, 1, 3);
            const isLTR = getSeededRandomInt(groupIndex * 200, 0, 1) === 1;

            const coordsPositions = count === 1
                ? [{ left: 50, top: 50, widthPercent: 100 }]
                : count === 2
                    ? [
                        { left: isLTR ? 30 : 70, top: 30, widthPercent: 90 },
                        { left: isLTR ? 70 : 30, top: 70, widthPercent: 90 },
                    ]
                    : [
                        { left: isLTR ? 70 : 30, top: 20, widthPercent: 70 },
                        { left: 50, top: 50, widthPercent: 70 },
                        { left: isLTR ? 30 : 70, top: 80, widthPercent: 70 },
                    ];

            for (let i = 0; i < count; i++) {
                if (beatIdx + i >= timingData.beat_times.length) break;
                items.push({
                    groupIndex,
                    layout: 'coordsImage',
                    imgIndex: (groupIndex + i) % images.length,
                    zIndex: groupIndex,
                    startFrame: Math.floor(timingData.beat_times[beatIdx + i] * fps),
                    coordsPos: coordsPositions[i],
                });
            }
            beatIdx += count;
        }

        return items;
    }, [fps, images]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* 배경 음악이 있다면 재생 */}
            {music && <Audio src={music} />}

            {renderItems.map((item, i) => {
                if (frame < item.startFrame) return null;

                const src = images[item.imgIndex];

                if (item.layout === 'single') {
                    return (
                        <Img
                            key={`single-${item.groupIndex}`}
                            src={src}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 0,
                                zIndex: item.zIndex,
                            }}
                            draggable={false}
                        />
                    );
                }

                if (item.layout === 'gridImage') {
                    // 세로형 비디오에 맞춰 세로로 4개 배치
                    const sizeW = width;
                    const sizeH = height / 4;
                    const gridIdx = item.gridIdx ?? 0;
                    const top = gridIdx * sizeH;
                    const left = 0;

                    return (
                        <Img
                            key={`grid-${item.groupIndex}-${gridIdx}`}
                            src={src}
                            style={{
                                position: 'absolute',
                                width: sizeW,
                                height: sizeH,
                                top,
                                left,
                                objectFit: 'cover',
                                borderRadius: 0,
                                zIndex: item.zIndex,
                            }}
                            draggable={false}
                        />
                    );
                }

                if (item.layout === 'coordsImage') {
                    const { left = 50, top = 50, widthPercent = 50 } = item.coordsPos || {};
                    return (
                        <Img
                            key={`coords-${item.groupIndex}-${item.imgIndex}-${i}`}
                            src={src}
                            style={{
                                position: 'absolute',
                                width: `${widthPercent}%`,
                                height: 'auto',
                                top: `${top}%`,
                                left: `${left}%`,
                                transform: 'translate(-50%, -50%)',
                                objectFit: 'cover',
                                borderRadius: 0,
                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                zIndex: item.zIndex,
                            }}
                            draggable={false}
                        />
                    );
                }

                return null;
            })}

            {/* 제목 표시 */}
            {title && (
                <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: '32px',
                    textAlign: 'center',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    fontWeight: 'bold',
                }}>
                    {title}
                </div>
            )}
        </AbsoluteFill>
    );
}; 