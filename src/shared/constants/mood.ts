export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface MoodOption {
  score: MoodScore;
  emoji: string;
  label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { score: 1, emoji: '😢', label: '매우 나쁨' },
  { score: 2, emoji: '😔', label: '나쁨' },
  { score: 3, emoji: '😐', label: '보통' },
  { score: 4, emoji: '🙂', label: '좋음' },
  { score: 5, emoji: '😄', label: '매우 좋음' },
];

export const MOOD_EMOJI: Record<MoodScore, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
};
