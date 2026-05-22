# SCSS-WORK-Example

이 프로젝트는 돌보미 사용자 화면과 구인구직 화면을 제작하면서 SCSS를 어떤 구조로 사용했는지 정리한 프론트엔드 작업입니다. 공통 값과 반복 패턴을 분리하고, 화면별 스타일 책임을 나누는 방식에 초점을 두었습니다.

## 프로젝트 배경

이 작업은 [돌보미](https://www.dolbomi.kr/main) 사이트의 디자인, 기획, 개발 착수 과정에서 진행한 프론트엔드 작업을 바탕으로 합니다. 돌보미는 돌봄 종사자를 위한 구인구직, 쇼핑, 커뮤니티 등 생활 서비스를 연결하는 사이트이며, 이 저장소에는 그중 사용자 화면과 구인구직 화면의 템플릿 및 스타일 작업이 포함되어 있습니다.

현재 이 저장소에 올린 코드는 전체 서비스 코드가 아니라 제가 직접 작업한 코드만 정리한 범위입니다. 또한 컨트롤러나 관련 java파일은 작업했으나 컨트롤러 외엔 깊게 관여하지 않았음으로 추가 하지 않았습니다.

프론트 화면은 Thymeleaf 템플릿을 기준으로 구성했습니다. `views` 안의 화면은 `th:replace`, `th:each`, `th:text`, `th:if` 같은 Thymeleaf 문법을 사용해 공통 head/header/footer 조각을 재사용하고, 컨트롤러에서 전달되는 데이터와 세션 상태를 화면에 반영할 수 있도록 작성했습니다.

또한 Codex를 활용해 메뉴 열림 상태, 모달, hover/focus 반응, 카드 전환처럼 사용자 행동에 반응하는 인터랙션 디자인을 다듬었고 작업의 속도를 높였습니다. 백엔드 개발자와 협업하면서 컨트롤러에서 연결될 화면 구조와 프론트 UI 흐름을 함께 맞추는 방식으로 작업했습니다.

| 항목 | 내용 |
| --- | --- |
| 서비스 | 돌보미 사용자 화면 및 구인구직 화면 |
| 화면 구성 | Thymeleaf 템플릿과 공통 include 조각 |
| 프론트 스타일 | SCSS 기반 공통 토큰, mixin, 화면별 entry 파일 |
| 인터랙션 | Codex를 활용한 상태 변화와 사용자 반응 디자인 보완 |
| 협업 | 백엔드 개발자와 컨트롤러 연동을 고려한 화면 구조 협업 |

## SCSS 구성

SCSS 원본은 `static/scss`에 모아 두었습니다.

```text
static/scss/
|-- _variables.scss  # 디자인 토큰, rem 함수, shadow 함수
|-- _mixins.scss     # flex, size, hover/focus, 채용 카드 공통 mixin
|-- _auth.scss       # 인증/가입 화면에서 반복되는 레이아웃과 폼 mixin
|-- common.scss      # 폰트, reset 보완, shell, 공통 인증 UI
|-- gnb.scss         # 사용자 GNB와 메뉴 패널
|-- main.scss        # 메인 화면, 서비스 카드, 메인 반응형 스타일
|-- login.scss       # 로그인, 회원가입, 계정 관련 화면
|-- news.scss        # 공지/뉴스 목록과 상세 화면
|-- map.scss         # 지도/검색 화면
|-- modal.scss       # 모달과 alert
`-- recruit.scss     # 구인구직 사용자 화면
```

파일명 앞에 `_`가 붙은 파일은 단독 CSS로 출력하기 위한 파일이 아니라 다른 SCSS에서 불러 쓰는 partial입니다. 화면별 entry 파일은 필요한 partial을 `@use`로 가져와 CSS를 만듭니다.

```scss
@use "variables" as *;
@use "mixins" as *;
```

`@import` 대신 Sass module 방식인 `@use`를 사용했습니다. `main.scss`, `map.scss`, `gnb.scss`, `recruit.scss`에서는 필요할 때 `sass:color` 같은 Sass 내장 모듈도 함께 사용합니다.

## 구조 의도

| 구분 | 역할 | 적용 예 |
| --- | --- | --- |
| 변수 | 색상, 간격, radius, shadow 같은 공통 값 관리 | `$color-main`, `$space-lg`, `$radius`, `$shadow` |
| 함수 | px 기준 값을 rem 단위로 일관되게 변환 | `rem(20)` |
| mixin | 반복되는 레이아웃과 상호작용 스타일 재사용 | `flex-center`, `size`, `hover-main`, `auth-text-input` |
| entry SCSS | 화면 단위로 스타일 범위 분리 | `login.scss`, `news.scss`, `recruit.scss` |
| nesting | HTML 구조와 상태 클래스를 읽기 쉽게 표현 | `&__item`, `&--active`, `&:focus-visible` |

### 1. 공통 값은 `_variables.scss`에서 관리

색상과 spacing을 변수로 모아 같은 값을 여러 화면에서 반복 입력하지 않도록 했습니다. 크기는 `rem()` 함수로 변환해 스타일 파일마다 단위 계산 방식이 달라지지 않게 했습니다.

```scss
@function rem($px) {
  @return #{math.div($px, 10)}rem;
}

$color-main: #e8485a;
$space-lg: rem(30);
$radius: rem(10);
```

그 결과 화면 스타일에서는 `padding: rem(30)`이나 `color: $color-main`처럼 의도를 바로 읽을 수 있습니다.

### 2. 반복 패턴은 mixin으로 재사용

`_mixins.scss`에는 flex 정렬, 요소 크기, hover/focus 상태, 채용 카드 스타일처럼 여러 화면에서 반복되는 패턴을 모았습니다.

```scss
@mixin flex-center($direction: row, $gap: 0) {
  display: flex;
  flex-direction: $direction;
  align-items: center;
  justify-content: center;
  gap: $gap;
}
```

```scss
.login-page__change-user--btn {
  @include flex-center(row, rem(5));
}
```

상호작용 스타일도 mixin 안에서 `focus-visible`, `active`, hover 가능한 포인터 환경을 함께 다뤄 버튼과 입력 요소의 상태 표현을 맞췄습니다.

### 3. 인증 UI는 `_auth.scss`로 한 번 더 분리

로그인, 가입, 계정 설정처럼 비슷한 폼 UI가 반복되는 영역은 일반 mixin과 분리해 `_auth.scss`에 정리했습니다. 페이지 shell, 제목, 설명문, 입력 필드, 버튼 행 같은 조합을 재사용합니다.

`common.scss`에서는 이 인증 mixin을 가져와 `.auth-page`, `.auth-form` 공통 규칙을 만들고, `login.scss`에서는 로그인 화면별 상세 스타일을 추가하는 방식입니다.

### 4. 화면별 entry 파일로 스타일 범위를 나눔

공통 자원을 공유하되 화면 성격에 따라 SCSS 파일을 나눴습니다.

| entry 파일 | 담당 스타일 |
| --- | --- |
| `common.scss` | 전역 폰트, 앱 shell, 공통 컴포넌트, 인증 공통 UI |
| `gnb.scss` | GNB, 전체 메뉴, 열림 상태 |
| `main.scss` | 메인 배경, 서비스 카드, 메인 반응형 배치 |
| `login.scss` | 로그인과 회원가입 흐름 |
| `news.scss` | 뉴스/공지 검색, 목록, 상세 |
| `map.scss` | 지도 검색과 필터 UI |
| `modal.scss` | modal, alert overlay |
| `recruit.scss` | 구인구직 PC/모바일 사용자 화면 |

`main.scss`는 `@use "map";`으로 지도 스타일도 함께 참조합니다. 따라서 `main.css`의 source map에는 `main.scss`와 `map.scss`가 같이 나타납니다.

## 작성 방식

### BEM 형태의 selector와 nesting

컴포넌트 단위 이름을 기준으로 element와 modifier를 중첩해 작성했습니다.

```scss
.gnb {
  &__all {
    .menu {
      &__line {
        &--top {
          top: 0;
        }
      }
    }
  }
}
```

컴파일 후에는 `.gnb__all .menu__line--top`처럼 일반 CSS selector가 됩니다. SCSS에서는 부모 맥락과 상태 규칙을 가까이 두어 긴 selector 반복을 줄였습니다.

### 상태와 반응형 규칙을 컴포넌트 가까이에 배치

hover, focus, active, 열린 메뉴 상태, 모바일 media query를 해당 selector 안쪽에 배치했습니다. 예를 들어 GNB는 `[aria-expanded="true"]` 상태와 모바일 메뉴 규칙을 같은 컴포넌트 블록에서 관리합니다.

이 방식은 화면별 SCSS 파일이 길어져도 특정 UI의 기본 스타일과 상태 스타일을 함께 찾기 쉽다는 장점이 있습니다.

### Sass 내장 기능 사용

단순 변수 치환 외에도 Sass 기능을 사용했습니다.

- `sass:math`로 `rem()` 함수의 단위 계산 처리
- `sass:color`로 색상의 alpha 변경이나 RGB channel 추출
- mixin 인자 기본값으로 상황별 변형 지원
- `@if`로 옵션이 들어온 경우에만 스타일 출력
- `#{}` interpolation으로 CSS 값 조합

예를 들어 채용 카드 mixin은 `$gap`과 `$interactive` 인자에 따라 출력할 규칙을 달리합니다.

## SCSS와 CSS 연결

브라우저는 SCSS를 직접 읽지 않으므로 컴파일된 CSS를 `views`의 head include에서 연결합니다.

| SCSS 원본 | 현재 CSS 산출물 |
| --- | --- |
| `common.scss` | `static/css/sso/user/common.css` |
| `gnb.scss` | `static/css/sso/user/gnb.css` |
| `main.scss` | `static/css/sso/user/main.css` |
| `login.scss` | `static/css/sso/user/login.css` |
| `news.scss` | `static/css/sso/user/news.css` |
| `map.scss` | `static/css/sso/user/map.css` |
| `modal.scss` | `static/css/sso/user/modal.css` |
| `recruit.scss` | `static/css/recruit/user/recruit.css` |

SSO 사용자 화면은 `views/sso/include/user/inc_head.html`에서 `main.css`, `common.css`, `gnb.css`, `login.css`, `news.css`, `modal.css`, `map.css`를 불러옵니다. 구인구직 사용자 화면은 `views/recruit/include/user/inc_head.html`에서 `recruit.css`를 불러옵니다.

현재 저장소에는 컴파일된 CSS와 source map이 함께 들어 있습니다. source map을 통해 브라우저 개발자 도구에서도 CSS 결과가 어떤 SCSS 파일에서 나왔는지 추적할 수 있습니다.

## 정리

이 프로젝트에서 SCSS는 단순히 CSS 문법을 중첩해서 쓰는 용도가 아니라 아래 목적에 맞춰 사용했습니다.

1. 색상과 spacing 같은 공통 기준을 변수와 함수로 통일
2. 반복되는 레이아웃과 입력/버튼 상태를 mixin으로 재사용
3. 인증 UI처럼 성격이 뚜렷한 공통 패턴을 별도 partial로 분리
4. 화면별 entry SCSS를 두어 스타일 책임 범위를 구분
5. nesting과 BEM 형태의 class로 컴포넌트 구조와 상태를 함께 표현
