# LifeArchiveCalendar - 코드 에이전트 가이드

## 서비스 개요

"평생 타임라인을 한 화면에서 줌인/줌아웃하며 보는 개인 기록 캘린더"

10년/1년/월/주/일 단위로 "영역 감각"이 생기도록 설계된 장기 기록 서비스

## 기술 스택

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4, `cn` 유틸 (clsx + tailwind-merge)
- **State**: Jotai (전역 UI/설정/캘린더 스케일)
- **Server State**: TanStack Query (모든 API 통신)
- **Motion & Gesture**: Framer Motion

## 폴더 구조 (FSD)

```
src/
├── app/                    # Next.js 앱 루트, Provider, 라우팅
├── widgets/                # 복합 UI 블록
│   ├── calendar-shell/     # 캘린더 컨테이너
│   └── calendar-header/    # 헤더 (네비게이션, 스케일 전환)
├── features/               # 비즈니스 기능
│   └── calendar-views/     # 각 스케일별 뷰
│       ├── decade-view/
│       ├── year-view/
│       ├── month-view/
│       ├── week-view/
│       └── day-view/
├── entities/               # 도메인 엔티티 (User, DayEntry 등)
└── shared/                 # 공용 모듈
    ├── components/         # 재사용 UI 컴포넌트
    ├── lib/                # 유틸리티 (cn, date-utils, query-client)
    ├── hooks/              # 커스텀 훅 (use-calendar)
    ├── stores/             # Jotai atoms
    ├── constants/          # 상수 (app-meta)
    └── types/              # 타입 정의
```

## 캘린더 뷰 설계 규칙

### 전역 상태

- `calendarScaleAtom`: `'decade' | 'year' | 'month' | 'week' | 'day'`
- `focusDateAtom`: `Date`
- localStorage에 스케일 저장 (키: `life-archive:calendarScale`)

### 스케일 전환

- 줌인: decade → year → month → week → day
- 줌아웃: 역순
- 한 번에 한 단계씩만 변경

### 뷰 컴포넌트 책임

각 뷰는 CalendarShell로부터 상태를 받아 해당 스케일에 맞는 UI만 렌더링

## 네이밍 규칙

```typescript
APP_ID = 'life-archive'
APP_DISPLAY_NAME = 'LifeArchiveCalendar'
STORAGE_PREFIX = 'life-archive:'
QUERY_KEY_PREFIX = 'life-archive'
```

## UX 원칙

1. **스케일 인식**: 어떤 뷰에서도 현재 포커스 날짜와 스케일을 헤더에 표시
2. **제스처 우선순위**: 스크롤/핀치/탭이 겹치지 않도록 분리
3. **입력 패턴**: "한 줄 입력 → 확장 가능한 일기" 기본
4. **성능**: 가상 스크롤/페이지네이션으로 대용량 처리

## 개발 우선순위

1. ✅ calendarScale + focusDate 전역 상태
2. ✅ Month/Day/Year/Week/Decade 뷰 기본 구현
3. 🔲 서버 연동 (로컬 mock 데이터 먼저)
4. 🔲 일기 입력/저장 기능
5. 🔲 감정 기록 (1~5점)
6. 🔲 태그/체크리스트

## 코딩 컨벤션

- 구조분해할당 필수
- 설명용 주석 작성 금지
- cn 유틸로 조건부 클래스 처리
- TanStack Query로 모든 서버 상태 관리
- Jotai로 UI/클라이언트 상태 관리
