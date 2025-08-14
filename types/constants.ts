import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  title: z.string(),
  images: z.array(z.string()).optional(),
  music: z.string().optional(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "Next.js and Remotion",
  images: [],
  music: undefined,
};

export const DURATION_IN_FRAMES = 200;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;
