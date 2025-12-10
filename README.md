# LifeArchiveCalendar

평생 타임라인을 한 화면에서 줌인/줌아웃하며 볼 수 있는 개인 기록 캘린더.

10년/1년/월/주/일 단위로 시간의 "영역 감각"이 생기도록 설계된 장기 기록 서비스다.

## 주요 기능

- **멀티 스케일 뷰**: Decade, Year, Month, Week, Day 5단계 줌 레벨 지원
- **부드러운 전환**: Framer Motion 기반 줌인/줌아웃 애니메이션
- **일기 기록**: 감정 점수(1~5), 태그, 체크리스트, 메트릭 지원
- **다크 모드**: 시스템 설정 연동

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4 |
| Animation | Framer Motion |
| Client State | Jotai |
| Server State | TanStack Query |
| Utilities | clsx, tailwind-merge |

## 설치

```bash
# 의존성 설치
pnpm install
# 또는
npm install
```

## 실행

```bash
# 개발 서버
pnpm dev
# 또는
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 빌드

```bash
# 프로덕션 빌드
pnpm build
# 또는
npm run build

# 프로덕션 서버 실행
pnpm start
# 또는
npm run start
```

## 폴더 구조

FSD(Feature-Sliced Design) 아키텍처를 따른다.

```
src/
├── app/                    # Next.js 앱 라우터, Provider
├── widgets/                # 복합 UI 블록
│   ├── calendar-shell/     # 메인 캘린더 컨테이너
│   └── calendar-header/    # 네비게이션, 스케일 전환
├── features/               # 비즈니스 기능
│   └── calendar-views/     # 스케일별 뷰 컴포넌트
│       ├── decade-view/
│       ├── year-view/
│       ├── month-view/
│       ├── week-view/
│       └── day-view/
└── shared/                 # 공용 모듈
    ├── lib/                # cn, date-utils, query-client
    ├── hooks/              # use-calendar 등 커스텀 훅
    ├── stores/             # Jotai atoms
    ├── constants/          # 앱 메타정보
    └── types/              # 타입 정의
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `dev` | 개발 서버 실행 |
| `build` | 프로덕션 빌드 |
| `start` | 프로덕션 서버 실행 |
| `lint` | ESLint 실행 |

## 라이선스

MIT
