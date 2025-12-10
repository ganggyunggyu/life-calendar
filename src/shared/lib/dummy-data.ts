import type { DayEntry, TimelineEvent } from '@/shared/types/calendar';

const LIFE_EVENTS: Array<{ year: number; month: number; day: number; title: string; color: string; description?: string }> = [
  { year: 1997, month: 8, day: 19, title: '🎂 탄생', color: '#ec4899', description: '세상에 태어난 날' },
  { year: 2004, month: 3, day: 2, title: '🎒 초등학교 입학', color: '#22c55e' },
  { year: 2010, month: 3, day: 2, title: '📚 중학교 입학', color: '#3b82f6' },
  { year: 2013, month: 3, day: 2, title: '🏫 고등학교 입학', color: '#8b5cf6' },
  { year: 2016, month: 3, day: 2, title: '🎓 대학교 입학', color: '#f59e0b' },
  { year: 2016, month: 11, day: 15, title: '💻 첫 코딩 시작', color: '#06b6d4' },
  { year: 2018, month: 6, day: 20, title: '🏢 첫 인턴십', color: '#10b981' },
  { year: 2019, month: 12, day: 31, title: '🎉 2010년대 마지막 날', color: '#f43f5e' },
  { year: 2020, month: 2, day: 1, title: '😷 코로나 시대 시작', color: '#6b7280' },
  { year: 2020, month: 8, day: 19, title: '🎂 23번째 생일', color: '#ec4899' },
  { year: 2021, month: 2, day: 26, title: '🎓 대학 졸업', color: '#eab308' },
  { year: 2021, month: 3, day: 15, title: '💼 첫 정규직', color: '#22c55e' },
  { year: 2022, month: 5, day: 10, title: '🚀 이직 성공', color: '#3b82f6' },
  { year: 2022, month: 8, day: 19, title: '🎂 25번째 생일', color: '#ec4899' },
  { year: 2023, month: 1, day: 1, title: '🎊 2023년 시작', color: '#f59e0b' },
  { year: 2023, month: 7, day: 15, title: '✈️ 첫 해외여행', color: '#06b6d4' },
  { year: 2023, month: 8, day: 19, title: '🎂 26번째 생일', color: '#ec4899' },
  { year: 2024, month: 1, day: 1, title: '🎊 2024년 시작', color: '#f59e0b' },
  { year: 2024, month: 4, day: 20, title: '📱 사이드 프로젝트 런칭', color: '#8b5cf6' },
  { year: 2024, month: 8, day: 19, title: '🎂 27번째 생일', color: '#ec4899' },
  { year: 2024, month: 12, day: 1, title: '📅 Life Calendar 개발 시작', color: '#10b981' },
  { year: 2025, month: 1, day: 1, title: '🎊 2025년 시작', color: '#f59e0b' },
];

const MOOD_WEIGHTS = [0.05, 0.15, 0.35, 0.30, 0.15];

const SUMMARY_TEMPLATES = [
  '오늘 하루도 무사히',
  '생산적인 하루였다',
  '조금 피곤한 날',
  '좋은 사람들과 만남',
  '새로운 것을 배웠다',
  '맛있는 거 먹은 날',
  '운동 완료!',
  '책 읽은 날',
  '영화 본 날',
  '코딩하느라 정신없음',
  '휴식의 날',
  '산책하기 좋은 날씨',
  '비 오는 날',
  '카페에서 작업',
  '친구 만난 날',
];

const TAGS = ['일상', '운동', '공부', '독서', '영화', '맛집', '여행', '코딩', '휴식', '사람들'];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function weightedMood(seed: number): 1 | 2 | 3 | 4 | 5 {
  const r = seededRandom(seed);
  let cumulative = 0;
  for (let i = 0; i < MOOD_WEIGHTS.length; i++) {
    cumulative += MOOD_WEIGHTS[i];
    if (r < cumulative) return (i + 1) as 1 | 2 | 3 | 4 | 5;
  }
  return 3;
}

export function generateDummyEntries(): Record<string, DayEntry> {
  const entries: Record<string, DayEntry> = {};
  const startDate = new Date(1997, 7, 19);
  const endDate = new Date();
  const current = new Date(startDate);

  let dayIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const seed = current.getTime();
    const hasEntry = seededRandom(seed + 1) < getEntryProbability(current);

    if (hasEntry) {
      const mood = weightedMood(seed + 2);
      const summaryIdx = Math.floor(seededRandom(seed + 3) * SUMMARY_TEMPLATES.length);
      const tagCount = Math.floor(seededRandom(seed + 4) * 3) + 1;
      const tags: string[] = [];

      for (let i = 0; i < tagCount; i++) {
        const tagIdx = Math.floor(seededRandom(seed + 5 + i) * TAGS.length);
        if (!tags.includes(TAGS[tagIdx])) tags.push(TAGS[tagIdx]);
      }

      entries[dateStr] = {
        date: dateStr,
        summaryText: SUMMARY_TEMPLATES[summaryIdx],
        moodScore: mood,
        tags,
        blocks: [],
      };
    }

    current.setDate(current.getDate() + 1);
    dayIndex++;
  }

  return entries;
}

function getEntryProbability(date: Date): number {
  const year = date.getFullYear();
  if (year < 2010) return 0.02;
  if (year < 2015) return 0.05;
  if (year < 2018) return 0.1;
  if (year < 2020) return 0.15;
  if (year < 2022) return 0.25;
  if (year < 2024) return 0.35;
  return 0.5;
}

export function generateDummyEvents(): TimelineEvent[] {
  return LIFE_EVENTS.map((event, idx) => ({
    id: `event-${idx}`,
    title: event.title,
    startDate: `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`,
    color: event.color,
    description: event.description,
  }));
}

export function initializeDummyData() {
  return {
    entries: generateDummyEntries(),
    events: generateDummyEvents(),
  };
}
