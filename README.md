# SoonTae Joo | Portfolio

사용자와 소통하며 비즈니스 문제를 해결하는 개발자 **SoonTae Joo**의 개인 포트폴리오 웹사이트입니다.

3D 별자리 배경, 섹션별 라우팅, 부드러운 전환을 결합한 포트폴리오이며, 콘텐츠는 JSON 파일로 관리합니다.

## 주요 기능

- **3D 은하 인터페이스** — 홈 화면의 별자리 노드가 곧 내비게이션이며, React Three Fiber 캔버스가 루트 레이아웃에서 상시 렌더링되어 라우트 전환에도 끊기지 않습니다
- **오프닝 시퀀스** — 첫 방문 시 별들이 은하로 수렴하는 인트로가 세션당 한 번 재생됩니다 (`sessionStorage` 게이트)
- **노드 → 페이지 워프 전환** — 노드를 선택하면 카메라가 구체로 진입(anticipation → warp → 플래시)한 뒤 실제 라우트로 이동, 뒤로 갈 때는 역방향으로 재생됩니다
- **섹션별 라우팅** — `/about`, `/skills`, `/experience`, `/projects`, `/lab`, `/contact`로 직접 접근
- **콘텐츠 주도 구조** — `content/` JSON 파일을 Zod 스키마로 검증해 렌더링
- **7개 섹션** — Hero, About, Skills, Experience, Projects, Lab, Contact
- **상세 패널** — Projects / Lab 항목 클릭 시 슬라이드 패널로 상세 내용 표시
- **성능/접근성 대응** — 기기 성능(`deviceMemory`, `hardwareConcurrency`, 포인터 타입)에 따라 파티클 수·블룸 이펙트를 조절하고, `prefers-reduced-motion` 설정 시 3D 모션을 생략합니다
- **모바일 대응** — 좁은 화면에서는 내비게이션이 스크롤 가능한 한 줄로, 홈 이동은 우측 하단 플로팅 버튼으로 분리됩니다
- **SEO** — Open Graph, Twitter Card, `robots` 메타데이터 지원

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei, @react-three/postprocessing |
| State | Zustand (은하 phase 상태 머신) |
| Animation | Framer Motion (일부 UI), CSS transitions/커스텀 GLSL 셰이더 (은하 시퀀스) |
| Validation | Zod |
| Font | Noto Sans KR, Playfair Display |

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
├── app/                    # Next.js App Router (layout, section routes, icons)
├── components/
│   ├── galaxy/             # 3D 은하 씬 (파티클, 노드, 카메라 리그, 전자 트래픽)
│   ├── interface/          # 은하 위에 오버레이되는 랜딩 인터페이스
│   ├── layout/             # PortfolioShell(내비게이션), RouteAurora
│   ├── motion/             # Framer Motion 래퍼 (fade-in, stagger, text-reveal 등)
│   ├── sections/           # 섹션별 UI 컴포넌트
│   └── ui/                 # Detail Panel, Work Card, Tag List 등 공통 UI
├── content/                # 포트폴리오 콘텐츠 (JSON)
├── hooks/                  # 커스텀 훅 (detail panel scroll lock 등)
├── lib/
│   ├── content/            # 콘텐츠 로더 및 Zod 스키마
│   ├── galaxy/             # 노드 좌표, 연결 커브, 배경 노드 생성 로직
│   ├── site.ts             # 사이트 설정 접근자
│   └── utils.ts            # 유틸리티
├── providers/              # Astryx 디자인 시스템, Detail Panel 컨텍스트
├── store/                  # Zustand 은하 phase 상태 머신
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

`content/sections.json`에서 섹션 배열 순서와 `node` 3D 좌표를 조정합니다. `id`는 라우트(`/about`, `/projects` 등)와 WebGL 진행 노드에 사용됩니다.

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
