# LifeArchiveCalendar

일반적인 캘린더 앱은 "이번 달"만 보여준다. 지난 10년이 어땠는지, 올해가 통째로 어떤 흐름이었는지는 한눈에 안 보인다. LifeArchiveCalendar는 하나의 화면에서 10년 단위부터 주 단위까지 줌인/줌아웃하면서 인생 전체의 기록을 훑어보려고 만든 개인용 기록 캘린더다.

각 스케일(10년/연/월/주)마다 그날의 감정 점수, 태그, 메모를 도트 그리드로 압축해서 보여주기 때문에, 굳이 하루하루 들어가지 않아도 "그해 여름엔 기분이 안 좋았구나" 같은 패턴을 눈으로 확인할 수 있게 하는 게 목표다.

## 주요 기능

- **멀티 스케일 뷰**: Decade → Year → Month → Week 4단계 줌 레벨, 스케일마다 도트 그리드로 활동 밀도 표시
- **제스처 줌**: 모바일 핀치 줌, 트랙패드 Ctrl+휠 핀치 모두 지원
- **일기 기록**: 감정 점수(1~5), 한 줄 요약, 노트 블록 입력 (모달 UI)
- **다크 모드**: 시스템 설정 연동 + 수동 토글, Jotai 전역 상태로 관리
- **PWA**: 홈 화면 설치, 오프라인 진입을 위한 서비스 워커 등록
- **로컬 우선 저장**: 서버 없이 `localStorage` 기반으로 즉시 기록/조회

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@theme inline` 디자인 토큰) |
| Animation | Framer Motion |
| Client State | Jotai (`atomWithStorage` 기반 영속화) |
| Server State | TanStack Query (Provider만 구성, 실제 API 연동 전 단계) |
| PWA | next-pwa |
| Utilities | clsx, tailwind-merge |

## 아키텍처 / 폴더 구조

FSD(Feature-Sliced Design)를 따르되, 아직 규모가 크지 않아 `entities` 레이어는 생략하고 `features`/`widgets`/`shared`만 사용한다.

```
src/
├── app/                          # Next.js 앱 라우터, Provider, 전역 스타일
│   ├── layout.tsx                # 폰트, 메타데이터, PWA manifest 연결
│   ├── page.tsx                  # CalendarShell 렌더링
│   └── providers.tsx             # Jotai + TanStack Query Provider
├── widgets/
│   ├── calendar-shell/           # 뷰 전환 애니메이션, 핀치 줌 바인딩 컨테이너
│   └── calendar-header/          # 스케일 세그먼트 컨트롤, 테마 토글, 오늘로 이동
├── features/
│   ├── calendar-views/           # 스케일별 뷰 컴포넌트
│   │   ├── decade-view/          # 12개월 도트 그리드
│   │   ├── year-view/            # 요일별 7-dot 패턴
│   │   ├── month-view/
│   │   └── week-view/            # 일별 7-dot + 주차 표시
│   └── entry-form/                # 하루 기록 입력 모달
└── shared/
    ├── lib/                      # cn, date-utils, query-client, dummy-data
    ├── hooks/                    # use-calendar, use-pinch-zoom, use-theme
    ├── stores/                   # Jotai atoms (calendar, entries, theme)
    ├── constants/                # app-meta, mood
    ├── types/                    # CalendarScale, DayEntry 등 도메인 타입
    └── ui/                       # Button, Input 등 공용 컴포넌트
```

## 설치 및 실행

### 요구 사항

- Node.js 20 이상 (devDependencies의 `@types/node` 기준)
- npm 또는 pnpm

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5001](http://localhost:5001) 접속. 포트가 3000이 아니라 **5001**인 이유는 트러블슈팅 섹션 참고.

### 3. 프로덕션 빌드 / 실행

```bash
npm run build
npm run start
```

### 4. Lint

```bash
npm run lint
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (webpack 모드, 5001 포트) |
| `npm run build` | 프로덕션 빌드 (webpack 모드) |
| `npm run start` | 프로덕션 서버 실행 (5001 포트) |
| `npm run lint` | ESLint 실행 |

## 트러블슈팅

### next-pwa가 Turbopack에서 동작하지 않아 webpack으로 강제 전환

Next.js 16부터 `next dev`/`next build`의 기본 번들러가 Turbopack으로 바뀌었는데, PWA 지원을 위해 붙인 `next-pwa`는 webpack 플러그인 방식으로 서비스 워커를 생성하기 때문에 Turbopack에서는 제대로 동작하지 않는다.

`70b0600` 커밋에서 `next-pwa`를 추가하면서 `package.json`의 스크립트에 `--webpack` 플래그를 명시적으로 붙였다.

```json
// package.json:6-8
"dev": "next dev --webpack -p 5001",
"build": "next build --webpack",
"start": "next start -p 5001",
```

같은 커밋에서 개발 서버 포트도 3000에서 5001로 바꿨다. 여러 Next.js 프로젝트를 동시에 로컬에서 띄워두는 작업 습관 때문에 기본 포트 충돌을 피하려고 고정한 값이다. `next.config.ts`에서는 개발 환경에서 서비스 워커가 매번 재생성되며 캐시가 꼬이는 걸 막기 위해 `disable: process.env.NODE_ENV === "development"`로 PWA 자체를 개발 모드에선 꺼둔다.

```typescript
// next.config.ts:4-8
const nextConfig: NextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})({})
```

### 핀치 줌 제스처가 한 번에 여러 단계씩 튀는 문제

`usePinchZoom` 훅 초기 버전은 두 손가락 거리 변화(`delta`)가 임계값을 넘을 때마다 곧바로 `onZoomIn`/`onZoomOut`을 호출했다. 터치 이벤트는 `touchmove`가 프레임마다 여러 번 발생하기 때문에, 손가락을 한 번 오므리는 동작만으로도 스케일이 2~3단계씩 건너뛰는 문제가 있었다.

`src/shared/hooks/use-pinch-zoom.ts:21-26`에 300ms 디바운스(`DEBOUNCE_MS`, `canZoom`)를 추가해서 한 번 줌이 트리거되면 그 다음 트리거까지 최소 시간 간격을 두도록 했다. 또한 트랙패드의 `Ctrl+휠` 핀치 제스처는 `deltaY`가 아주 작은 값으로 촘촘하게 들어오기 때문에, 즉시 반응하지 않고 `accumulatedDelta`에 누적시켰다가 `WHEEL_THRESHOLD`(30)를 넘을 때만 줌을 발생시킨다.

```typescript
// src/shared/hooks/use-pinch-zoom.ts:19-22
const accumulatedDelta = useRef<number>(0);
const DEBOUNCE_MS = 300;
const WHEEL_THRESHOLD = 30;
```

### Day 뷰 제거 — 스케일이 늘어날수록 네비게이션 분기가 감당이 안 됨

초기 설계는 `decade/year/month/week/day` 5단계 줌이었다. 그런데 스케일이 늘어날 때마다 `navigatePrev`/`navigateNext`/`getVisibleRange` 같은 함수에 `case 'day':` 분기가 하나씩 늘어났고, `day` 뷰는 `week` 뷰와 보여주는 정보(감정 점수, 태그, 이벤트)가 거의 겹치는데 헤더 UI만 별도로 분리돼 있어 유지보수 비용 대비 얻는 게 적었다.

`b18c920` 커밋에서 `DayView` 컴포넌트(154줄)를 통째로 제거하고, 하루 단위 기록/조회는 각 뷰에서 날짜를 탭하면 뜨는 `EntryFormModal`로 통합했다.

```typescript
// src/shared/types/calendar.ts:1
export type CalendarScale = 'decade' | 'year' | 'month' | 'week';
```

```typescript
// src/shared/stores/calendar.ts:38
export const SCALE_ORDER: CalendarScale[] = ['decade', 'year', 'month', 'week'];
```

이 변경 이후 `CalendarHeader`도 "day 뷰일 때만 이전/다음 화살표 표시"하던 조건부 렌더링을 걷어내고(`77433cc`), 모든 스케일에서 동일한 세그먼트 컨트롤을 쓰도록 단순화했다.

### 모바일에서 헤더 버튼이 너무 좁아서 탭 안 되는 문제

헤더의 스케일 전환 버튼들이 "10년/연/월/주" 같은 전체 라벨을 항상 표시하다 보니 좁은 화면에서 버튼 폭이 줄어들어 탭 정확도가 떨어졌다. `6bbc78f` 커밋에서 라벨을 `short`/`full` 두 가지로 나눠 화면 크기에 따라 다르게 보여주는 방식으로 바꿨다.

```typescript
// src/widgets/calendar-header/CalendarHeader.tsx:14
const SCALE_LABELS: Record<CalendarScale, { short: string; full: string }> = {
  decade: { short: '10Y', full: '10년' },
  ...
};
```

```tsx
// src/widgets/calendar-header/CalendarHeader.tsx:89-90
<span className="sm:hidden">{SCALE_LABELS[s].short}</span>
<span className="hidden sm:inline">{SCALE_LABELS[s].full}</span>
```

동시에 버튼 최소 크기를 `min-w-8 sm:min-w-10 min-h-8 sm:min-h-9`로 고정해서 모바일에서도 최소한의 탭 영역을 확보하도록 했다.

## 알려진 제약사항 / 향후 계획

- **서버 연동 없음**: 모든 기록은 `atomWithStorage`로 브라우저 `localStorage`에만 저장된다. TanStack Query Provider는 구성돼 있지만(`src/app/providers.tsx`) 실제 API 호출 훅은 아직 없다. 기기를 바꾸면 기록이 이어지지 않는다.
- **태그/체크리스트/메트릭 미구현**: `DayEntry` 타입(`src/shared/types/calendar.ts`)에는 `tags`, `EntryBlock`(checklist, metric, photo)이 정의돼 있지만 `EntryFormModal`에서는 감정 점수와 텍스트 요약/노트만 입력 가능하다.
- **더미 데이터로만 검증 가능**: 실 사용 데이터가 쌓이기 전까지는 헤더의 "더미 데이터 로드" 버튼(`src/shared/lib/dummy-data.ts`)으로 UI를 확인하는 구조다.

## 라이선스

개인 프로젝트로 별도 라이선스를 명시하지 않았다. 코드 참고는 자유롭게 하되, 재배포나 상업적 이용은 문의 바란다.
