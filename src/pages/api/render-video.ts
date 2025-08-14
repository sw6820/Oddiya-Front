import { NextApiRequest, NextApiResponse } from 'next';
import { renderMedia } from '@remotion/renderer';
import { BeatVideo } from '../../remotion/MyComp/BeatVideo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { title, images } = req.body;

        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ message: 'Images array is required' });
        }

        // 렌더링 진행률을 추적하기 위한 변수
        let currentProgress = 0;

        const onProgress = (progress: { progress: number }) => {
            currentProgress = progress.progress;
            console.log(`Rendering progress: ${(currentProgress * 100).toFixed(1)}%`);
        };

        // 동영상 렌더링 (BeatVideo 사용)
        const outputPath = await renderMedia({
            composition: {
                id: "BeatVideo",
                durationInFrames: 600, // BeatVideo는 약 20초 (30fps 기준)
                fps: 30,
                width: 1080,
                height: 1920,
                defaultProps: {
                    title: title || "여행 추억",
                    images,
                    music: undefined // 음악은 선택사항
                },
                props: {
                    title: title || "여행 추억",
                    images,
                    music: undefined
                },
                defaultCodec: "h264",
                defaultOutName: "travel-shorts",
                defaultVideoImageFormat: "jpeg",
                defaultPixelFormat: "yuv420p"
            },
            serveUrl: process.env.NODE_ENV === 'production'
                ? 'https://your-domain.com'
                : 'http://localhost:3000',
            codec: "h264",
            outputLocation: `./public/videos/travel-shorts-${Date.now()}.mp4`,
            onProgress,
            inputProps: {
                title: title || "여행 추억",
                images,
                music: undefined
            }
        });

        res.status(200).json({
            success: true,
            message: 'Video rendered successfully',
            outputPath,
            progress: 100
        });

    } catch (error) {
        console.error('Video rendering error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to render video',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
