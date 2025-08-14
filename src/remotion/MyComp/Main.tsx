import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NextLogo } from "./NextLogo";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
import React, { useMemo } from "react";
import { Rings } from "./Rings";
import { TextFade } from "./TextFade";
import { CompositionProps, DURATION_IN_FRAMES } from "../../../types/constants";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});

const container: React.CSSProperties = {
  backgroundColor: "white",
};

const logo: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
};

export const Main = ({ title, images = [] }: z.infer<typeof CompositionProps>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitionStart = 2 * fps;
  const transitionDuration = 1 * fps;

  const logoOut = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: transitionDuration,
    delay: transitionStart,
  });

  const titleStyle: React.CSSProperties = useMemo(() => {
    return { fontFamily, fontSize: 70 };
  }, []);

  // 이미지가 있는 경우 이미지 슬라이드쇼를 표시
  if (images && images.length > 0) {
    const imageDuration = Math.floor((DURATION_IN_FRAMES - transitionStart - transitionDuration) / images.length);

    return (
      <AbsoluteFill style={container}>
        <Sequence durationInFrames={transitionStart + transitionDuration}>
          <Rings outProgress={logoOut}></Rings>
          <AbsoluteFill style={logo}>
            <NextLogo outProgress={logoOut}></NextLogo>
          </AbsoluteFill>
        </Sequence>

        {/* 이미지 슬라이드쇼 */}
        {images.map((image, index) => (
          <Sequence
            key={index}
            from={transitionStart + transitionDuration + (index * imageDuration)}
            durationInFrames={imageDuration}
          >
            <AbsoluteFill style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
            }}>
              <img
                src={image}
                alt={`Image ${index + 1}`}
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  objectFit: "contain",
                }}
              />
              <div style={{
                position: "absolute",
                bottom: "50px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                fontFamily,
                fontSize: "24px",
                textAlign: "center",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}>
                {title}
              </div>
            </AbsoluteFill>
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  }

  // 이미지가 없는 경우 기존 레이아웃
  return (
    <AbsoluteFill style={container}>
      <Sequence durationInFrames={transitionStart + transitionDuration}>
        <Rings outProgress={logoOut}></Rings>
        <AbsoluteFill style={logo}>
          <NextLogo outProgress={logoOut}></NextLogo>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={transitionStart + transitionDuration / 2}>
        <TextFade>
          <h1 style={titleStyle}>{title}</h1>
        </TextFade>
      </Sequence>
    </AbsoluteFill>
  );
};
