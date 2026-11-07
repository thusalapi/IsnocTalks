import type { Annotation, Shape } from './types';

export function toAnnotation(a: {
  id: string;
  timestamp: number;
  duration: number;
  note: string;
  shapes: unknown;
}): Annotation {
  return {
    id: a.id,
    timestamp: a.timestamp,
    duration: a.duration,
    note: a.note,
    shapes: Array.isArray(a.shapes) ? (a.shapes as Shape[]) : [],
  };
}
