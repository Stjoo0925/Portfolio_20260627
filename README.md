# SoonTae Joo | Portfolio

사용자와 소통하며 비즈니스 문제를 해결하는 개발자 **SoonTae Joo**의 개인 포트폴리오 웹사이트입니다.

3D 별자리 배경, 부드러운 스크롤, 섹션별 인터랙션을 결합한 싱글 페이지 포트폴리오이며, 콘텐츠는 JSON 파일로 관리합니다.

## 주요 기능

- **3D 별자리 배경** — React Three Fiber 기반 캔버스가 스크롤에 따라 카메라가 이동하며 섹션 노드를 따라갑니다
- **부드러운 스크롤** — Lenis + 스냅 포인트로 섹션 단위 탐색
- **콘텐츠 주도 구조** — `content/` JSON 파일을 Zod 스키마로 검증해 렌더링
- **7개 섹션** — Hero, About, Skills, Experience, Projects, Lab, Contact
- **상세 패널** — Projects / Lab 항목 클릭 시 슬라이드 패널로 상세 내용 표시
- **접근성** — `prefers-reduced-motion` 설정 시 3D 캔버스 비활성화
- **SEO** — Open Graph, Twitter Card, `robots` 메타데이터 지원

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei |
| Animation | Framer Motion |
| Scroll | Lenis |
| Validation | Zod |
| Font | Noto Sans KR, Playfair Display, Geist Mono |

## 시작하기

### 요구 사항

- Node.js 20 이상
- npm (또는 pnpm, yarn, bun)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 빌드 및 프로덕션 실행

```bash
npm run build
npm run start
```

### 린트

```bash
npm run lint
```

## 프로젝트 구조

```
├── app/                    # Next.js App Router (layout, page, 아이콘)
├── components/
│   ├── canvas/             # 3D 캔버스 (별자리 씬, 카메라 리그)
│   ├── motion/             # Framer Motion 래퍼 (fade-in, stagger 등)
│   ├── sections/           # 섹션별 UI 컴포넌트
│   └── ui/                 # Nav, Detail Panel, Tag List 등 공통 UI
├── content/                # 포트폴리오 콘텐츠 (JSON)
├── hooks/                  # 커스텀 훅
├── lib/
│   ├── content/            # 콘텐츠 로더 및 Zod 스키마
│   ├── site.ts             # 사이트 설정 접근자
│   └── utils.ts            # 유틸리티
├── providers/              # Smooth Scroll, Detail Panel 컨텍스트
└── types/                  # 타입 선언
```

## 콘텐츠 수정

포트폴리오 텍스트와 데이터는 코드 수정 없이 `content/` 디렉터리의 JSON 파일만 편집하면 됩니다.

| 파일 | 설명 |
|------|------|
| `site.json` | 사이트 이름, 제목, 설명, URL, SNS 링크 |
| `sections.json` | 섹션 순서, 종류, 3D 노드 좌표 |
| `hero.json` | 인사말, 이름, 역할, 태그라인, CTA |
| `about.json` | 소개 문단, 하이라이트 |
| `skills.json` | 기술 스택 카테고리 |
| `experience.json` | 경력, 학력, 교육, 자격증 |
| `projects.json` | 프로젝트 목록 및 상세 |
| `lab.json` | 실험/사이드 프로젝트 목록 및 상세 |
| `contact.json` | 연락처 섹션 콘텐츠 |

콘텐츠는 `lib/content/schema.ts`의 Zod 스키마로 런타임에 검증됩니다. 스키마와 맞지 않는 필드가 있으면 빌드/실행 시 오류가 발생합니다.

### 사이트 URL 변경

배포 전 `content/site.json`의 `url` 값을 실제 도메인으로 변경하세요. 이 값은 Open Graph 메타데이터의 `metadataBase`로 사용됩니다.

```json
{
  "url": "https://your-domain.com"
}
```

### 섹션 순서 변경

`content/sections.json`에서 섹션 배열 순서와 `node` 3D 좌표를 조정합니다. `id`는 HTML 앵커(`#about`, `#projects` 등)로 사용됩니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |

## 배포

Next.js 표준 방식으로 배포할 수 있습니다. [Vercel](https://vercel.com)에 연결하거나 `npm run build` 후 `npm run start`로 자체 호스팅이 가능합니다.

배포 시 `content/site.json`의 `url`과 `links`(GitHub, LinkedIn, 이메일)를 실제 값으로 업데이트하세요.

## 라이선스

Private — 개인 포트폴리오 용도
