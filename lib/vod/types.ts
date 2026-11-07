import { z } from 'zod';

/** A point in normalised video space: 0,0 is top-left and 1,1 is bottom-right. */
export const pointSchema = z.object({
  x: z.number().min(-0.5).max(1.5),
  y: z.number().min(-0.5).max(1.5),
});

const base = {
  id: z.string().max(40),
  color: z.string().max(20),
  /** Stroke width as a fraction of the video width */
  size: z.number().min(0.0005).max(0.05),
};

export const shapeSchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('pen'), points: z.array(pointSchema).max(4000) }),
  z.object({ ...base, type: z.literal('line'), from: pointSchema, to: pointSchema }),
  z.object({ ...base, type: z.literal('arrow'), from: pointSchema, to: pointSchema }),
  z.object({ ...base, type: z.literal('rect'), from: pointSchema, to: pointSchema }),
  z.object({ ...base, type: z.literal('ellipse'), from: pointSchema, to: pointSchema }),
  z.object({ ...base, type: z.literal('text'), at: pointSchema, text: z.string().max(200) }),
]);

export const shapesSchema = z.array(shapeSchema).max(300);

export type Point = z.infer<typeof pointSchema>;
export type Shape = z.infer<typeof shapeSchema>;
export type ShapeType = Shape['type'];
export type Tool = ShapeType | 'none';

export type Annotation = {
  id: string;
  timestamp: number;
  duration: number;
  note: string;
  shapes: Shape[];
};

export type VodSourceType = 'YOUTUBE' | 'FILE';

export const DRAW_COLORS = ['#ff3b3b', '#ffd400', '#22e06b', '#2fa8ff', '#ffffff', '#c86bff'];

export const DRAW_SIZES = [
  { label: 'S', value: 0.003 },
  { label: 'M', value: 0.005 },
  { label: 'L', value: 0.009 },
];
