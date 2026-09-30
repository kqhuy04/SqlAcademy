# SQL Detective Noir — UI/UX & Frontend Design Audit (Phase 1)

> **Scope:** Full UI/UX, accessibility, typography, token, responsive, state, and theme coherence audit of `fe/src` (`React + Vite + Tailwind CSS`).
> **Methodology:** Evaluated area by area (**Common → Academy → Cases**) against the 10 core design & engineering principles and the `frontend-design` skill guidelines. Every finding is marked `[VERIFIED]` (directly measured from source code, computed contrast ratios, or CSS rules) or `[INFERRED]` (derived from layout/DOM behavior across viewports) and cites exact `file:line` references.

---

## Executive Summary

### Overall Score per Principle (1–5 Rubric)
> **Rubric:** `5` = No issues · `4` = Minor polish only · `3` = Several Major issues · `2` = One Critical or many Major issues · `1` = Multiple Critical issues

| # | Principle | Score (1–5) | Justifying Issue IDs | Key Evidence Summary |
| :- | :--- | :---: | :--- | :--- |
| 1 | **Visual Hierarchy & Spacing / Grid / Whitespace** | **3 / 5** | `COM-01`, `COM-11`, `COM-12`, `ACAD-04`, `CASE-05` | Strong dossier framing overall, but broken by non-existent shadow tokens (`shadow-noir-md/lg/xs` failing to compile), double container padding on Blog pages, and non-sticky 2-column scrolling on Cases. |
| 2 | **Typography & Vietnamese Diacritics Support** | **3 / 5** | `COM-02`, `COM-11`, `ACAD-04` | `Be Vietnam Pro` & `IBM Plex Mono` support Vietnamese well, but `tailwind.config.js` maps all 4 font tokens (`display`, `serif`, `typewriter`, `sans`) to `Be Vietnam Pro` while still downloading unused `Playfair Display` & `Source Serif 4`; missing `900 italic` causes faux-oblique synthesis on Vietnamese diacritics; prose reaches 95–135ch (`PostDetailPage`, `TutorialTheorySection`); `<html lang="en">` mismatches default `'VI'`. |
| 3 | **Color System & WCAG AA Contrast** | **1 / 5** | `COM-01`, `COM-03`, `ACAD-04`, `CASE-04` | Multiple Critical WCAG AA failures: `text-noir-amber`/`candle` (`#C9972C`) on `#EDE3C9` is **1.92:1–2.08:1**; `text-noir-candleDark` (`#A67818`) on `#E5D9BC`/`#EDE3C9` is **2.86:1–3.11:1**; `text-noir-inkFaint` (`#7A6B58`) & `#8C7E6D` on parchment is **3.30:1–3.78:1**. Color tokens are triplicated across `noir`/`detective`/`police` with 20+ hardcoded hex overrides. |
| 4 | **Gestalt & Consistency (UI & Bilingual i18n)** | **1 / 5** | `COM-04`, `COM-08`, `COM-11`, `ACAD-02`, `CASE-02`, `CASE-03` | Language switcher is hidden inside an authenticated modal on `/profile`, locking unauthenticated users out of English; 3-Tab Academy workspace (`TutorialDossierTab`, `TutorialInterrogationTab`, `TutorialSolveTab`) ignores `lang` and renders `*Vi` only; `CaseDetailPage` error/toast strings are English-only; Blog pages leave Vietnamese strings in `EN` mode. |
| 5 | **Nielsen's 10 Heuristics** | **2 / 5** | `COM-04`, `COM-06`, `COM-12`, `ACAD-03`, `ACAD-04`, `CASE-03` | Clicking `+` or FK links in `EvidenceBoard` generates broken double-wrapped SQL (`SELECT * FROM SELECT * FROM ...`); Academy "Reset" overwrites challenge starter code with lesson starter code; `CaseListPage` "Clear Search Filters" fails to reset `statusFilter`; `CaseSuccessModal` renders two buttons that do the exact same navigation. |
| 6 | **Interaction Feedback (States on Interactive Elements)** | **2 / 5** | `COM-08`, `COM-09`, `ACAD-01`, `ACAD-03`, `ACAD-04`, `CASE-01`, `CASE-03` | `TutorialDossierTab` Live Query table fails to render on initial load because `dbRef.current` mutation doesn't trigger re-render; `ProfilePage` avatar upload has a hover-only overlay invisible on touch/keyboard; clickable `<div>` cards lack `focus-visible` rings. |
| 7 | **Fitts's Law (≥40px), Hick's Law, Miller's Law & Progressive Disclosure** | **3 / 5** | `COM-05`, `COM-10`, `ACAD-01`, `ACAD-04`, `CASE-01`, `CASE-05` | Widespread sub-40px touch targets (`20px–32px`) on Navbar actions, pagination buttons (`32px`), question lead switchers (`24px`), Academy toolbar buttons (`24px–28px`), and schema/pinboard action icons (`20px–22px`). |
| 8 | **Complete States (Empty, Loading, Error, Success, 404, No-Permission)** | **1 / 5** | `COM-08`, `COM-09`, `COM-11`, `ACAD-03`, `CASE-02`, `CASE-03` | `CaseDetailPage` misreports any 404/500/network error as a Premium paywall ("Access Restricted • Classified Dossier"); `LeaderboardPage` shows "No detectives have been ranked yet" while `isLoading` is true; `ProfilePage`, `CertificatePage`, and `TutorialListPage` ignore `user_progress` loading/error states; `/admin/posts` lacks a `ROLE_ADMIN` guard/no-permission UI. |
| 9 | **Accessibility (Keyboard, Focus, Semantics, ARIA, Labels, Reduced Motion)** | **1 / 5** | `COM-05`, `COM-06`, `COM-07`, `COM-08`, `COM-09`, `COM-10`, `ACAD-01`, `ACAD-04`, `CASE-01` | Core flows (`CaseCard`, `TutorialListPage` lessons, `SqlWikiPage` rows, `ProfilePage` avatar upload, `DetectiveRanksAndBadges` cards) use `<div onClick>`/`<tr onClick>` and are unreachable by keyboard; `Modal.tsx` lacks `role="dialog"`, `aria-modal`, and focus trap; `ResetPasswordPage` password toggle sets `tabIndex={-1}`; zero `prefers-reduced-motion` support. |
| 10 | **Responsive Behavior (360/768/1280/1920), Motion & Theme Coherence** | **3 / 5** | `COM-05`, `COM-07`, `COM-09`, `COM-10`, `COM-12`, `ACAD-04`, `CASE-04`, `CASE-05` | Navbar switches to horizontal desktop layout at `sm:` (`640px`), overflowing at `768px` in Vietnamese; `CertificatePage` overflows at `360px`; `DetectiveRanksAndBadges`, `SqlWikiPage`, and `EvidenceBoard` drift into `rounded-xl` modern dark-SaaS gradients and off-palette hexes; `SQLEditor` uses stark `bg-white`. |

---

### The 5 Biggest Problems Across the Application

1. **Keyboard-Inaccessible Core User Journeys & Non-Compliant Modals (`COM-06`, `COM-08`, `COM-09`, `ACAD-01`, `CASE-01`):**
   Primary navigation and learning cards — including every `CaseCard` on `/cases`, every lesson row on `/tutorials`, every SQL clause row on `/wiki`, the avatar uploader on `/profile`, and badge cards — are implemented as `<div onClick>` or `<tr onClick>` without `<button>`/`<a>` semantics, `tabIndex={0}`, or keyboard handlers. Additionally, `Modal.tsx` lacks `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and focus trapping.
2. **Broken Bilingual Experience & Inaccessible Language Switcher (`COM-04`, `COM-08`, `COM-11`, `ACAD-02`, `CASE-02`):**
   The global language toggle (`setLang`) is only reachable inside an authenticated "Edit Profile" modal on `/profile` (`ProfilePage.tsx:284-291`) and on workspace headers—leaving unauthenticated visitors on Landing, Login, Register, Leaderboard, Tutorials List, Wiki, and Case List with no way to switch languages. Worse, when switched to English (`EN`), the entire 3-Tab Academy workspace (`TutorialDossierTab`, `TutorialInterrogationTab`, `TutorialSolveTab`) still renders Vietnamese lesson data (`*Vi`), while `CaseDetailPage` hardcodes English error screens and toast messages in Vietnamese mode.
3. **Critical Functional & State Bugs in Interactive Workspaces (`ACAD-03`, `ACAD-04`, `CASE-02`, `CASE-03`):**
   - In `TutorialWorkspacePage.tsx:141,198,571`, storing the SQLite WASM instance in `dbRef.current` without state causes `TutorialDossierTab`'s Live Query table to stay blank on initial load.
   - In `EvidenceBoard.tsx:225-227,316`, clicking `+` or a Foreign Key link passes a full `SELECT * FROM ...` string into `CaseDetailPage.handleInsertTableQuery`, which wraps it again into invalid SQL (`SELECT * FROM SELECT * FROM table LIMIT 10; LIMIT 10;`).
   - In `CaseDetailPage.tsx:349-366`, any 404/500/network error is misreported as a "Classified Dossier (Premium)" paywall.
4. **Severe WCAG AA Contrast Failures on Amber/Gold & Faint Tokens (`COM-03`, `ACAD-04`, `CASE-04`):**
   `noir.candle` / `noir.amber` (`#C9972C`) used as text on `#EDE3C9` (`bg-noir-paper`) yields **2.08:1** (and **1.92:1** on `#E5D9BC` in `TutorialTheorySection.tsx:245`), while `noir.candleDark` (`#A67818`) on `#E5D9BC` yields **2.86:1** — failing WCAG AA (4.5:1) across Navbar user rank labels, score counters, badges, and Case cards.
5. **Fragmented Design Tokens, Dead Font Loads & Silent Invalid Tailwind Classes (`COM-01`, `COM-02`, `COM-10`, `CASE-04`):**
   `tailwind.config.js` triplicates the color palette (`noir`, `detective`, `police`), maps all 4 font families (`display`, `serif`, `typewriter`, `sans`) to `Be Vietnam Pro` while downloading unused `Playfair Display` and `Source Serif 4` in `index.html`, and components across all three areas rely on undefined classes (`shadow-noir-xs`, `shadow-noir-md`, `shadow-noir-lg`, `bg-noir-parchmentDark`, `border-3`, `border-l-3`, `py-0.2`, `backdrop-blur-xs`, `animate-fadeIn`) plus 20+ hardcoded hex values.

---

## 1. Discovery Map (Pages, Components & Active Tokens)

### 1.1 Route & Page Inventory (`fe/src/router/index.tsx`)
| Area | Route | Page Component | Access Guard | Layout Wrapper |
| :--- | :--- | :--- | :--- | :--- |
| **Common** | `/` | `LandingPage.tsx` | Public | `PageWrapper (fullWidth)` |
| **Common** | `/login` | `LoginPage.tsx` | `PublicOnlyRoute` | Standalone (`AnimatedPage`) |
| **Common** | `/register` | `RegisterPage.tsx` | `PublicOnlyRoute` | Standalone (`AnimatedPage`) |
| **Common** | `/reset-password` | `ResetPasswordPage.tsx` | `PublicOnlyRoute` | Standalone (`AnimatedPage`) |
| **Common** | `/profile` | `ProfilePage.tsx` | `PrivateRoute` | `PageWrapper` |
| **Common** | `/certificate` | `CertificatePage.tsx` | `PrivateRoute` | `PageWrapper` |
| **Common** | `/leaderboard` | `LeaderboardPage.tsx` | Public | `PageWrapper` |
| **Common** | `/posts` | `PostListPage.tsx` | Public | `PageWrapper` |
| **Common** | `/posts/new`, `/posts/edit/:id` | `PostEditorPage.tsx` | `PrivateRoute` | `PageWrapper` |
| **Common** | `/posts/:slug` | `PostDetailPage.tsx` | Public | `PageWrapper` |
| **Common** | `/admin/posts` | `AdminPostModerationPage.tsx` | `PrivateRoute` (missing role guard) | `PageWrapper` |
| **Common** | `/404`, `*` | `NotFoundPage.tsx` | Public | Standalone |
| **Academy** | `/tutorials` | `TutorialListPage.tsx` | Public | `PageWrapper` |
| **Academy** | `/tutorials/:moduleId/:lessonId` | `TutorialWorkspacePage.tsx` | Public | Custom full-screen workspace |
| **Academy** | `/wiki` | `SqlWikiPage.tsx` | Public | `PageWrapper` |
| **Cases** | `/cases` | `CaseListPage.tsx` | Public | `PageWrapper` |
| **Cases** | `/cases/:id` | `CaseDetailPage.tsx` | `PrivateRoute` | Custom full-screen workspace |

### 1.2 Shared & Feature Components
- **Layout (`fe/src/components/layout/`):** `Navbar.tsx`, `PageWrapper.tsx`
- **UI Primitives (`fe/src/components/ui/`):** `AnimatedPage.tsx`, `AppLogo.tsx`, `Badge.tsx`, `Button.tsx`, `Input.tsx`, `Modal.tsx`, `Spinner.tsx`, `StampBadge.tsx`, `TypewriterText.tsx`
- **Common (`fe/src/components/common/`, `auth/`, `profile/`, `blog/`):** `DetectiveNotes.tsx`, `QueryHistoryPanel.tsx`, `GoogleAuthButton.tsx`, `DetectiveRanksAndBadges.tsx`, `MarkdownViewer.tsx`
- **Academy (`fe/src/components/tutorial/`):** `DetectiveAnalogyCard.tsx`, `SqlExecutionDiagram.tsx`, `TutorialDossierTab.tsx`, `TutorialExplainPlan.tsx`, `TutorialInterrogationTab.tsx`, `TutorialNavHeader.tsx`, `TutorialResultTable.tsx`, `TutorialSchemaViewer.tsx`, `TutorialSolveTab.tsx`, `TutorialSQLEditor.tsx`, `TutorialTheorySection.tsx`
- **Cases (`fe/src/components/case/`):** `CaseCard.tsx`, `CaseSuccessModal.tsx`, `EvidenceBoard.tsx`, `HintPanel.tsx`, `ResultTable.tsx`, `SQLEditor.tsx`, `SubscribeModal.tsx`, `TableSchemaViewer.tsx`

---

## 2. Area-by-Area Issue Log

### Area 1: Common (Layout, UI Primitives, Auth, Landing, Profile, Certificate, Leaderboard, Dispatches/Blog, 404)

#### `COM-01` — `[VERIFIED]` Triplicated color namespaces, phantom shadow classes (`shadow-noir-md/lg/xs`), and invalid Tailwind utilities (`border-3`, `py-0.2`, `backdrop-blur-xs`)
- **Severity:** Major
- **Effort:** M
- **File + Component:**
  - `fe/tailwind.config.js:10-92` (theme config)
  - `fe/src/router/index.tsx:26` (`PageLoader`), `fe/src/pages/PostDetailPage.tsx:153` (`border-3`)
  - `fe/src/pages/LandingPage.tsx:208,223,238,253` (`shadow-noir-xs`)
  - `fe/src/components/auth/GoogleAuthButton.tsx:212`, `fe/src/pages/ProfilePage.tsx:160,340`, `fe/src/pages/LeaderboardPage.tsx:47,136,181`, `fe/src/pages/PostListPage.tsx:81,290`, `fe/src/pages/PostDetailPage.tsx:166,227,357`, `fe/src/pages/PostEditorPage.tsx:228`, `fe/src/pages/AdminPostModerationPage.tsx:86` (`shadow-noir-md`)
  - `fe/src/pages/CertificatePage.tsx:140`, `fe/src/pages/LeaderboardPage.tsx:91`, `fe/src/pages/NotFoundPage.tsx:18` (`shadow-noir-lg`)
  - `fe/src/components/common/QueryHistoryPanel.tsx:180,189,315,316,324,327` & `fe/src/components/profile/DetectiveRanksAndBadges.tsx:289,380,449,459` (`py-0.2`, `backdrop-blur-xs`, `animate-fadeIn`)
- **Primary Principle:** Consistency & Design Tokens
- **Secondary Principles:** Visual Hierarchy (elevation cues lost when shadow classes fail to compile)
- **What is wrong (Evidence):**
  1. `tailwind.config.js:10-76` defines three parallel color objects (`noir`, `detective`, `police`) with identical hex values, plus duplicate keys inside `noir` itself (`blood`/`wax`: `#8B1A1A`, `candle`/`amber`: `#C9972C`, `candleDark`/`amberDark`: `#A67818`, `stamp`/`stampGreen`: `#2A4B2A`, `inkMuted`/`muted`: `#4A3E30`, `card`/`paperDark`: `#E5D9BC`).
  2. `tailwind.config.js:85-92` only defines `shadow-noir-sm`, `shadow-noir-card`, and `shadow-noir-lift`. However, 15+ places across Common use `shadow-noir-xs`, `shadow-noir-md`, and `shadow-noir-lg`, which do not exist in `tailwind.config.js` and silently produce zero box-shadow.
  3. `router/index.tsx:26` and `PostDetailPage.tsx:153` use `border-3` (invalid in Tailwind v3), causing the loading spinner ring border width to fail. `QueryHistoryPanel.tsx` and `DetectiveRanksAndBadges.tsx` use `py-0.2`, `backdrop-blur-xs`, and `animate-fadeIn`, none of which exist in Tailwind v3 or `index.css`.
- **Recommended Fix:** Consolidate `tailwind.config.js` around `noir.*` (aliasing `detective`/`police` only if needed for backward compatibility), register `noir-xs`, `noir-md`, `noir-lg` in `boxShadow` and `fadeIn` in `keyframes`/`animation`, and replace `border-3` with `border-2` or `border-[3px]` and `py-0.2` with `py-0.5`.

---

#### `COM-02` — `[VERIFIED]` Font token collapse, unused Google Fonts payload, Vietnamese faux-italic synthesis, and hardcoded `<html lang="en">`
- **Severity:** Major
- **Effort:** S
- **File + Component:**
  - `fe/index.html:2,10-14`
  - `fe/tailwind.config.js:79-84`
  - `fe/src/pages/LandingPage.tsx:44`
  - `fe/src/pages/CertificatePage.tsx:285`
- **Primary Principle:** Typography (max 2 families, clear type scale, full Vietnamese diacritics support)
- **Secondary Principles:** Accessibility (`lang` attribute), Performance, Theme Coherence
- **What is wrong (Evidence):**
  1. `fe/index.html:10-14` downloads **4 font families** from Google Fonts (`Be Vietnam Pro`, `IBM Plex Mono`, `Playfair Display`, `Source Serif 4` — 25 font axes/weights total), violating the max-2-families rule. Yet `fe/tailwind.config.js:79-84` maps `display`, `serif`, `typewriter`, and `sans` all to `['"Be Vietnam Pro"', 'system-ui', 'sans-serif']`. Thus `Playfair Display` and `Source Serif 4` are never rendered despite being preloaded, and every semantic font class (`font-display`, `font-serif`, `font-typewriter`, `font-sans`) collapses into the exact same sans-serif face, flattening typographic hierarchy between dossier headers, typewriter stamps, and body copy.
  2. **Vietnamese Diacritics Check:** While `Be Vietnam Pro` and `IBM Plex Mono` natively support full Vietnamese diacritics (`latin-ext` + `vietnamese`), `fe/index.html:10` only loads italic weights `1,400;1,600;1,700` for `Be Vietnam Pro`. In `LandingPage.tsx:44` (`font-display font-black ... italic` = weight `900` italic: *"ĐỂ SQL VẠCH MẶT KẺ THỦ ÁC."*) and `CertificatePage.tsx:285` (`font-serif italic ... font-black`), the browser is forced to synthesize faux-oblique on weight `900`, distorting stacked Vietnamese diacritics (`Ể`, `Ạ`, `Ặ`, `Ủ`).
  3. `fe/index.html:2` hardcodes `<html lang="en">` even though `languageStore.ts:22` defaults the application to `'VI'`, causing screen readers and browser glyph/hyphenation engines to parse Vietnamese content as English.
- **Recommended Fix:** Remove unused `Playfair Display` and `Source Serif 4` from `index.html:10-14` to strictly enforce 2 font families (`Be Vietnam Pro` for display/serif/sans + `IBM Plex Mono` for mono/typewriter stamps, or include `ital,wght@1,800;1,900` if bold italics are used); map `font-typewriter` to `IBM Plex Mono` (which has full Vietnamese diacritics support) so dossier metadata/stamps regain authentic typewriter contrast against `Be Vietnam Pro` prose; sync `document.documentElement.lang` (`'vi'` / `'en'`) dynamically in `languageStore.ts`.

---

#### `COM-03` — `[VERIFIED]` WCAG AA Contrast Failures on Amber/Candle Gold Text and Muted Dates
- **Severity:** Critical
- **Effort:** S
- **File + Component:**
  - `fe/src/pages/ProfilePage.tsx:312,381` (`ProfilePage`)
  - `fe/src/pages/LeaderboardPage.tsx:77,122,166,245` (`LeaderboardPage`)
  - `fe/src/pages/CertificatePage.tsx:228,277` (`CertificatePage`)
  - `fe/src/components/ui/Badge.tsx:25` (`Badge` variant `gold`)
  - `fe/src/components/ui/StampBadge.tsx:28-29` (`StampBadge` variants `candle`, `gold`)
  - `fe/src/pages/LandingPage.tsx:100` (`LandingPage` SQL snippet `WHERE` clause)
- **Primary Principle:** Color System & WCAG AA Contrast (4.5:1 body / 3:1 large text)
- **Secondary Principles:** Accessibility, Visual Hierarchy
- **What is wrong (Evidence):**
  - `noir.amber` / `noir.candle` (`#C9972C`, relative luminance $L = 0.352$) used as foreground text on `noir.paper` (`#EDE3C9`, $L = 0.788$) or `#EBE0C7` ($L = 0.742$) yields a contrast ratio of **1.98:1 to 2.08:1** — failing both WCAG AA normal text (4.5:1) and large text (3:1). Affected lines: `ProfilePage.tsx:381` (`+{item.scoreEarned} ⭐`), `LeaderboardPage.tsx:77,122,166,245` (`totalScore`), and `CertificatePage.tsx:228` (`⭐ {user?.totalScore}`).
  - `noir.candleDark` (`#A67818`, $L = 0.219$) on `noir.paper` (`#EDE3C9`, $L = 0.788$) yields **3.11:1**, and on `noir.paperDark` (`#E5D9BC`, $L = 0.720$) yields **2.86:1**. This fails WCAG AA 4.5:1 on 10px–12px text in `Badge.tsx:25`, `StampBadge.tsx:28-29`, and `LandingPage.tsx:100`, and fails 3:1 large text in `ProfilePage.tsx:312` (`text-2xl sm:text-3xl font-black text-noir-candleDark` inside `bg-noir-paperDark/50`).
  - `CertificatePage.tsx:277` renders `text-[10px] text-[#8C7E6D]` ($L = 0.223$) on `bg-[#F7EFE0]` ($L = 0.875$), yielding **3.39:1** (fails 4.5:1 for 10px text).
- **Recommended Fix:** Darken the foreground token for gold/amber text on parchment/paper surfaces to `#784F0A` (`amber-900` / new `noir.candleText`, which achieves **5.45:1** on `#EDE3C9` and **4.98:1** on `#E5D9BC`), keeping `#C9972C` strictly for backgrounds/borders/icons with dark ink text (`#1A1612`). Replace `text-[#8C7E6D]` in `CertificatePage.tsx:277` with `text-noir-inkMuted` (`#4A3E30`, **11.1:1**).

---

#### `COM-04` — `[VERIFIED]` Language switcher is inaccessible to unauthenticated users and buried inside a Profile modal; Mobile unauthenticated menu omits "Dispatches" (`/posts`)
- **Severity:** Critical
- **Effort:** S
- **File + Component:**
  - `fe/src/components/layout/Navbar.tsx:25,60-140,169-310`
  - `fe/src/pages/ProfilePage.tsx:284-291,468-538`
- **Primary Principle:** Nielsen's Heuristics (User Control & Freedom; Flexibility & Efficiency of Use)
- **Secondary Principles:** Consistency, Recognition over Recall
- **What is wrong (Evidence):**
  1. `Navbar.tsx:25` reads `{ lang } = useLanguageStore()` but provides no UI control to toggle language. The only control calling `setLang` in the Common area is inside `ProfilePage.tsx:284-291` ("Cài Đặt Ngôn Ngữ"), which is behind `<PrivateRoute>` (`router/index.tsx:124-128`). Unauthenticated users on `LandingPage`, `LoginPage`, `RegisterPage`, `ResetPasswordPage`, `TutorialListPage`, `SqlWikiPage`, `CaseListPage`, `PostListPage`, `LeaderboardPage`, and `NotFoundPage` are locked into Vietnamese (`'VI'`) with zero way to switch to English (`'EN'`).
  2. In `Navbar.tsx:262-307`, the mobile dropdown for unauthenticated users lists `/tutorials`, `/cases`, `/wiki`, and `/leaderboard`, completely omitting `/posts` ("Bản Tin" / "Dispatches"), whereas desktop unauthenticated users see `/posts` at `Navbar.tsx:69-72`.
- **Recommended Fix:** Add a compact `VI / EN` toggle button directly in `Navbar.tsx` (both desktop right action bar and mobile menu header) and on standalone Auth pages; add the missing `/posts` link to the unauthenticated mobile menu in `Navbar.tsx:278`.

---

#### `COM-05` — `[VERIFIED]` Navbar tablet overflow at 768px and sub-40px touch targets violating Fitts's Law
- **Severity:** Major
- **Effort:** S
- **File + Component:**
  - `fe/src/components/layout/Navbar.tsx:36,60,117-123,143-165,196-244`
  - `fe/src/components/ui/Button.tsx:43`
- **Primary Principle:** Responsive Behavior (360 / 768 / 1280 / 1920 px)
- **Secondary Principles:** Fitts's Law (target size ≥ 40px), Accessibility (missing `aria-label` / `aria-expanded` on hamburger button)
- **What is wrong (Evidence):**
  1. `Navbar.tsx:60,84,143` switches from the mobile hamburger menu to the full horizontal desktop bar at `sm:` (`640px`). At `768px` viewport width in Vietnamese (`VI`), the brand logo (`SQL DETECTIVE NOIR` + icon) + 5 nav items (`Học Viện`, `Vụ Án`, `Bản Tin`, `Cẩm Nang`, `Bảng Xếp Hạng` with `whitespace-nowrap`) + right actions (`Đăng Nhập` + `Đăng Ký` or score pill + username + logout) exceed `768px`, causing cramped collision/clipping.
  2. Interactive targets fall below the 40×40px Fitts's Law threshold: desktop nav links (`py-1.5` = ~28px high, `Navbar.tsx:36`), logout icon button (`p-1.5` with `w-4 h-4` = 28×28px, `Navbar.tsx:120`), mobile Academy pill (`py-1` = ~26px high, `Navbar.tsx:149`), mobile nav items (`py-2` = ~32px high, `Navbar.tsx:199-243`), and `Button` `size="sm"` (`py-1.5` = ~30px high, `Button.tsx:43`).
  3. The mobile menu toggle button (`Navbar.tsx:159-164`) has only an icon (`<Menu />` / `<X />`) with no `aria-label` and no `aria-expanded={mobileMenuOpen}`.
- **Recommended Fix:** Change the Navbar responsive breakpoint from `sm:` to `lg:` (`1024px`) so `768px` tablet viewports use the clean collapsible drawer; increase touch target heights/padding to `min-h-[40px]` (`p-2.5` on icon buttons, `py-2.5` on mobile links); add `aria-label` and `aria-expanded` to the menu toggle button.

---

#### `COM-06` — `[VERIFIED]` Modal accessibility failures and inconsistent dialog implementations (`Modal` vs `SnapshotModal` vs `window.confirm`)
- **Severity:** Critical
- **Effort:** M
- **File + Component:**
  - `fe/src/components/ui/Modal.tsx:50-110`
  - `fe/src/components/common/QueryHistoryPanel.tsx:94-99,292-418` (`SnapshotModal`)
  - `fe/src/pages/PostDetailPage.tsx:124`
- **Primary Principle:** Accessibility (keyboard navigation, semantic HTML, ARIA dialog pattern)
- **Secondary Principles:** Consistency, Fitts's Law
- **What is wrong (Evidence):**
  1. `Modal.tsx:64-107` renders a `<motion.div>` without `role="dialog"`, `aria-modal="true"`, `aria-labelledby` linked to the modal title (`line 88`), or focus management (focus is not moved into the modal on open or trapped within it).
  2. The close button in `Modal.tsx:95-102` has no `aria-label` (`<X className="w-5 h-5" />` inside `<button>`) and has a 28×28px hit target (`p-1`).
  3. `QueryHistoryPanel.tsx:292-418` builds a bespoke `SnapshotModal` instead of reusing `<Modal>`, lacking `Escape` key closing, `role="dialog"`, `aria-modal="true"`, and backdrop click closing.
  4. Clearing notes in `DetectiveNotes.tsx:281-323` uses a themed Noir `<Modal>`, whereas clearing query history in `QueryHistoryPanel.tsx:94` and deleting a post in `PostDetailPage.tsx:124` use native browser `window.confirm()`.
- **Recommended Fix:** Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trapping, and `aria-label="Close modal"` (`min-w-[40px] min-h-[40px]`) to `Modal.tsx`; refactor `SnapshotModal` in `QueryHistoryPanel.tsx` to use `<Modal>`; replace `window.confirm` in `QueryHistoryPanel.tsx:94` and `PostDetailPage.tsx:124` with `<Modal>` confirmations.

---

#### `COM-07` — `[VERIFIED]` No `prefers-reduced-motion` support across page transitions, stamps, typewriter text, or spinners
- **Severity:** Major
- **Effort:** S
- **File + Component:**
  - `fe/src/index.css:99-117`
  - `fe/src/components/ui/AnimatedPage.tsx:15-24`
  - `fe/src/components/ui/StampBadge.tsx:57-70`
  - `fe/src/components/ui/TypewriterText.tsx:23-47`
  - `fe/src/components/ui/Spinner.tsx:20-33`
- **Primary Principle:** Accessibility (`prefers-reduced-motion`) & Motion
- **Secondary Principles:** Nielsen's Heuristics (User Control)
- **What is wrong (Evidence):**
  - `fe/src/index.css` has zero `@media (prefers-reduced-motion: reduce)` rules.
  - `AnimatedPage.tsx:15-24` (`y: 8` slide + fade on every route change), `StampBadge.tsx:57-70` (spring scale from `1.3`), and `TypewriterText.tsx:23-47` (character-by-character interval animation with pulsing cursor) do not check `useReducedMotion()` or `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- **Recommended Fix:** Add a global `@media (prefers-reduced-motion: reduce)` block in `fe/src/index.css` that disables CSS animations/transitions, and use Framer Motion's `useReducedMotion()` in `AnimatedPage.tsx`, `StampBadge.tsx`, `Modal.tsx`, and `window.matchMedia` in `TypewriterText.tsx` to render full text immediately when reduced motion is enabled.

---

#### `COM-08` — `[VERIFIED]` Standalone Auth/404 pages lack navigation/language header; broken keyboard/ARIA on password fields and form inputs
- **Severity:** Critical
- **Effort:** M
- **File + Component:**
  - `fe/src/pages/LoginPage.tsx:106-220`
  - `fe/src/pages/RegisterPage.tsx:95-250`
  - `fe/src/pages/ResetPasswordPage.tsx:95-212,154-160`
  - `fe/src/pages/NotFoundPage.tsx:13-59`
  - `fe/src/components/ui/Input.tsx:14-59`
  - `fe/src/pages/ProfilePage.tsx:421-439`
- **Primary Principle:** Accessibility (keyboard navigation, form labels, ARIA associations)
- **Secondary Principles:** Consistency, Error Prevention (Nielsen #5)
- **What is wrong (Evidence):**
  1. **Unreachable Password Toggle (`ResetPasswordPage.tsx:154-160`):** The show/hide password `<button>` has `tabIndex={-1}` (making it impossible to toggle via keyboard), has no `aria-label`, and is positioned via `absolute right-3 top-8` outside `<Input>` (which shifts vertically if the label wraps on 360px screens) instead of using `<Input rightIcon={...} />`.
  2. **Inconsistent Password Fields:** `RegisterPage.tsx:202-214` (`Confirm Passphrase`) and `ResetPasswordPage.tsx:164-176` omit the show/hide toggle icon on the confirmation input; `ProfilePage.tsx:421-439` (`Change Investigation Passphrase` modal) lacks show/hide toggles on both password fields and performs zero client-side validation for the 8-char/uppercase/digit/symbol rule stated in its own subtitle (`line 416`), leading to avoidable server 400 errors.
  3. **Fragile `Input` ID generation (`Input.tsx:14-17`):** `inputId` is derived via `label.toLowerCase().replace(/\s+/g, '-')`, which leaves Vietnamese diacritics and parentheses in DOM IDs (e.g., `mã-định-danh-đặc-vụ-(5-30-ký-tự)`) and evaluates to `undefined` whenever `label` is omitted, causing `errorId` and `helperId` (`lines 16-17`) to be `undefined` and breaking `aria-describedby`.
  4. **Missing Header/Navigation on Auth & 404 (`LoginPage.tsx:110`, `RegisterPage.tsx:99`, `ResetPasswordPage.tsx:99`, `NotFoundPage.tsx:13`):** These 4 pages omit `PageWrapper`/`Navbar`, provide no language toggle, and use a generic `<Shield>` icon instead of `<AppLogo />`. Also `NotFoundPage.tsx:13` references a `.paper-texture` class that does not exist in `index.css`.
- **Recommended Fix:** Use `React.useId()` as the fallback ID in `Input.tsx`; pass the show/hide toggle via `rightIcon` in `ResetPasswordPage.tsx`, `RegisterPage.tsx`, and `ProfilePage.tsx` (without `tabIndex={-1}`, with localized `aria-label` and 40×40px hit area); add client-side password rule validation to `ProfilePage.tsx`; add a consistent top bar with `<AppLogo />`, back-to-home link, and language switcher on Auth & 404 pages.

---

#### `COM-09` — `[VERIFIED]` Keyboard-inaccessible avatar upload, missing loading/error states on Profile & Certificate, and misleading empty state on Leaderboard
- **Severity:** Critical
- **Effort:** M
- **File + Component:**
  - `fe/src/pages/ProfilePage.tsx:96-100,185-219,355-406`
  - `fe/src/pages/CertificatePage.tsx:31-34,140,223`
  - `fe/src/pages/LeaderboardPage.tsx:16-25,43-178,259-274`
- **Primary Principle:** Complete States (empty, loading, error) & Accessibility
- **Secondary Principles:** Visibility of System Status (Nielsen #1), Responsive Behavior (360px)
- **What is wrong (Evidence):**
  1. **Avatar Upload A11y & Touch Discovery (`ProfilePage.tsx:185-219`):** The avatar container is a `<div onClick={...}>` with no `role="button"`, `tabIndex={0}`, `aria-label`, or `onKeyDown` handler, blocking keyboard and screen-reader users from uploading an avatar. The camera prompt (`line 203`) uses `opacity-0 group-hover:opacity-100`, so mobile/tablet touch users have no visual cue that the avatar is interactive.
  2. **Silent Loading/Error States (`ProfilePage.tsx:96-100,355-406` & `CertificatePage.tsx:31-34`):** Both pages query `user_progress` via `useQuery` without destructuring `isLoading` or `isError`. While fetching or on network error, `casesCompletedCount` displays `0` and `ProfilePage.tsx:399` falsely shows the empty state *"No case questions recorded in personnel ledger yet"*.
  3. **Leaderboard Layout Shift & False Empty Copy (`LeaderboardPage.tsx:16-25,43-178,259-274`):** While `isLoading` is true, `top3` is `[]`, so the entire Top 3 Podium disappears and then pops in when data arrives (layout shift), and `isError` is unhandled. Worse, if `leaderboard` returns `0` total users (`leaderboard.length === 0`), the fallback at `lines 264-267` renders *"Top investigators are recognized on the Honor Podium above"* beneath an empty podium!
  4. **Certificate 360px Overflow (`CertificatePage.tsx:140,198,223`):** On 360px screens, `p-8` + `grid-cols-3` (`line 223`) + `px-8` (`line 198`) crushes the 3 stat boxes and long usernames horizontally.
- **Recommended Fix:** Convert the avatar wrapper in `ProfilePage.tsx:185` to a `<button type="button">` with visible focus ring and a persistent corner camera badge on touch screens; handle `isLoading` (skeleton/spinner) and `isError` (retry banner) for `user_progress` in `ProfilePage.tsx` and `CertificatePage.tsx` and for `leaderboard` in `LeaderboardPage.tsx`; distinguish `leaderboard.length === 0` from `remainingLeaderboard.length === 0`; use `p-5 sm:p-8 lg:p-14` and `grid-cols-1 sm:grid-cols-3` in `CertificatePage.tsx`.

---

#### `COM-10` — `[VERIFIED]` Visual theme drift (`rounded-xl` + SaaS gradients), non-semantic interactive `<div>`s, and unlabelled inputs in Profile & Common widgets
- **Severity:** Major
- **Effort:** M
- **File + Component:**
  - `fe/src/components/profile/DetectiveRanksAndBadges.tsx:237-481`
  - `fe/src/components/common/DetectiveNotes.tsx:159-265`
  - `fe/src/components/common/QueryHistoryPanel.tsx:117-252`
- **Primary Principle:** Theme Coherence ("SQL detective" identity) & Accessibility
- **Secondary Principles:** Consistency, Fitts's Law
- **What is wrong (Evidence):**
  1. `DetectiveRanksAndBadges.tsx:237-481` departs from the 1940s Noir Dossier language (`rounded-[3px]`/`rounded-[4px]`, `border-2 border-noir-borderDark`, flat ink/blood/paper surfaces) by using modern SaaS styling: `rounded-xl` (`line 237`), `rounded-lg` (`lines 241,263,269`), vibrant multi-stop gradients (`from-amber-600 to-amber-900`, `from-slate-600 to-slate-800`), and 15+ hardcoded hex classes (`bg-[#EDE3C9]`, `border-[#C4B6A0]`, `bg-[#E2D5B8]`, `bg-[#F5ECD7]`, `bg-[#DCD0B4]`).
  2. Badge cards in `DetectiveRanksAndBadges.tsx:400-443` use `<div onClick={() => setSelectedBadge(badge)}>` without `<button>`, `tabIndex={0}`, or keyboard handlers, and the tab switcher (`lines 270-292`) lacks `role="tablist"` / `role="tab"` / `aria-selected`.
  3. `DetectiveNotes.tsx:259-265` (`<textarea>`) and `QueryHistoryPanel.tsx:117-127` (search `<input>`) have no `<label>` or `aria-label`. Action/tag buttons in `DetectiveNotes.tsx:181-189,200-254` and `QueryHistoryPanel.tsx:206-250` have `22px–26px` heights (`py-0.5` / `p-1`), violating Fitts's Law.
- **Recommended Fix:** Align `DetectiveRanksAndBadges.tsx` with `noir.*` tokens and `rounded-[4px]` dossier borders; convert badge cards to `<button type="button">` elements and add `role="tablist"`/`role="tab"`/`aria-selected`; add `aria-label` to the note `<textarea>` and history filter `<input>`, and increase toolbar button touch targets.

---

#### `COM-11` — `[VERIFIED]` Untranslated Vietnamese copy in English mode, >95ch prose line lengths on Dispatches, unlabelled form inputs, and missing Admin role guard
- **Severity:** Major
- **Effort:** M
- **File + Component:**
  - `fe/src/pages/PostListPage.tsx:79,182,378-389`
  - `fe/src/pages/PostDetailPage.tsx:65,88,105,132,192,234,274,278,305,312,320,327,338,341,346,377-383,445`
  - `fe/src/pages/PostEditorPage.tsx:57,71,117,160,179,243-348`
  - `fe/src/pages/AdminPostModerationPage.tsx:20-264`
  - `fe/src/components/blog/MarkdownViewer.tsx:12,108`
  - `fe/src/router/index.tsx:115-120`
- **Primary Principle:** Consistency (Bilingual Completeness & Layout Padding) & Typography (45–75ch line length)
- **Secondary Principles:** Complete States (`no-permission`), Accessibility (form labels)
- **What is wrong (Evidence):**
  1. **Broken Bilingual Support (`EN` mode shows Vietnamese):**
     - `PostListPage.tsx:182` hardcodes `CHỦ ĐỀ:`; lines `378,382,386` hardcode `title="Lượt xem"`, `"Lượt thích"`, `"Bình luận"`.
     - `PostDetailPage.tsx` hardcodes Vietnamese in `lines 65,88,105,132` (error toasts), `line 234` (`⚠️ TRẠNG THÁI: ... (Lý do: ...)`), `lines 274,278` (`lượt xem`, `bình luận`), `lines 305,312,320,327,338,341` (social bar tooltips/labels `Đã chép link` / `Chia sẻ`), and `line 445` (`title="Xóa bình luận"`).
     - `PostEditorPage.tsx` hardcodes Vietnamese in `lines 57,71,117,160,266,314,335`, and `MarkdownViewer.tsx:108` hardcodes `'Đã sao chép mã lệnh vào clipboard'`.
     - `AdminPostModerationPage.tsx:44-258` is 95% hardcoded in Vietnamese despite importing `lang` at `line 21`.
  2. **Excessive Line Length & Busy Background (`PostDetailPage.tsx:346`, `MarkdownViewer.tsx:12`):** `MarkdownViewer` uses `max-w-none` inside a `max-w-4xl` (`896px`) container, resulting in **95–110ch** line lengths (violating the 45–75ch readability rule), rendered over a high-frequency dotted pattern (`bg-[radial-gradient(#C4B6A0_1px,transparent_1px)] [background-size:16px_16px]`) that degrades reading comfort.
  3. **Double Container Padding (`PostListPage.tsx:79`, `PostDetailPage.tsx:192`, `PostEditorPage.tsx:179`, `AdminPostModerationPage.tsx:84`):** `PageWrapper` (`PageWrapper.tsx:25`) already applies `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`, and these 4 pages nest a second `px-4 sm:px-6 lg:px-8 py-8` container inside it, doubling horizontal and vertical padding on 360px mobile screens.
  4. **Missing `no-permission` State (`router/index.tsx:115-120`, `AdminPostModerationPage.tsx:28-32`):** `/admin/posts` only checks `isAuthenticated` via `PrivateRoute`, not `user?.role === 'ROLE_ADMIN'`. A non-admin detective visiting `/admin/posts` hits a 403 API failure that is not handled (`error` is ignored in `AdminPostModerationPage.tsx:29`), falsely displaying *"Hàng chờ kiểm duyệt đang trống!"* ("Moderation queue is empty!") at `line 109`!
  5. **Unassociated Form Labels (`PostEditorPage.tsx:243-281,325-348`, `PostDetailPage.tsx:377-383`, `AdminPostModerationPage.tsx:231-237`):** Raw `<label>` elements lack `htmlFor` and raw `<input>`/`<textarea>` elements lack `id` or `aria-label`.
- **Recommended Fix:** Localize all remaining Vietnamese strings in `PostListPage`, `PostDetailPage`, `PostEditorPage`, `AdminPostModerationPage`, and `MarkdownViewer`; constrain article prose to `max-w-[68ch] mx-auto` on a clean `bg-noir-paper` surface; remove duplicate inner padding wrappers; add an explicit `no-permission` ("SECURITY CLEARANCE DENIED • ADMIN ONLY") state when `user?.role !== 'ROLE_ADMIN'` in `AdminPostModerationPage.tsx` (and `PrivateRoute`); wire `htmlFor`/`id` on all editor and comment inputs.

---

#### `COM-12` — `[VERIFIED]` False sequential numbering (`01–04`) on non-sequential audience personas and tablet hero headline `whitespace-nowrap` overflow on LandingPage
- **Severity:** Minor
- **Effort:** S
- **File + Component:**
  - `fe/src/pages/LandingPage.tsx:41,207-266`
- **Primary Principle:** Visual Hierarchy & Structural Information (`frontend-design` skill: only number actual sequences)
- **Secondary Principles:** Responsive Behavior (768px)
- **What is wrong (Evidence):**
  1. `LandingPage.tsx:209-211,224-226,239-241,254-256` labels the 4 target audience cards ("Beginners", "Students", "Developers", "Puzzle Fans") with `01`, `02`, `03`, `04`. Per the `frontend-design` skill, numbered markers encode sequence/order and should not be used as generic decoration on unordered categories.
  2. `LandingPage.tsx:41` applies `sm:whitespace-nowrap` to `<h1 className="text-2xl sm:text-4xl lg:text-5xl ...">` (`"DỮ LIỆU KHÔNG BAO GIỜ NÓI DỐI."`), forcing 29 uppercase characters in `36px` (`text-4xl`) onto a single line starting at `640px` (`sm:`), which overflows horizontally between `640px` and `768px`.
- **Recommended Fix:** Replace the decorative `01–04` numbers on the audience persona cards with semantic icons (`Compass`, `GraduationCap`, `Terminal`, `Search`); change `sm:whitespace-nowrap` on `LandingPage.tsx:41` to `lg:whitespace-nowrap` or allow natural wrapping with `text-balance`.

---

### Area 2: Academy (`TutorialListPage`, `TutorialWorkspacePage`, `SqlWikiPage`, `components/tutorial/*`)

#### `ACAD-01` — `[VERIFIED]` Keyboard-inaccessible lesson rows, module headers, Wiki table rows, and diagram steps; invalid `<th>` flex layout
- **Severity:** Critical
- **Effort:** M
- **File + Component:**
  - `fe/src/pages/TutorialListPage.tsx:148-153,222-249,260-288`
  - `fe/src/pages/SqlWikiPage.tsx:198-216,248,259-293`
  - `fe/src/components/tutorial/SqlExecutionDiagram.tsx:176-205`
- **Primary Principle:** Accessibility (keyboard navigation, semantic HTML, ARIA attributes, form labels)
- **Secondary Principles:** Gestalt (alignment), Interaction Feedback (focus rings)
- **What is wrong (Evidence):**
  1. **Unreachable Academy Lessons (`TutorialListPage.tsx:260-288`):** Every lesson item in the module checklist is a `<div onClick={() => handleStartLesson(module.id, lesson.id)}>` with no `<button>` or `<Link>`, no `tabIndex={0}`, no `onKeyDown` handler, and no focus ring. Keyboard-only users cannot open any individual lesson in the Academy.
  2. **Module Accordion Header (`TutorialListPage.tsx:148-153,222-249`):** The clickable module bar is a `<div onClick={...}>` containing a nested `<button>` (`line 222`) that lacks `aria-expanded={!isCollapsed}`.
  3. **Unreachable SQL Handbook Clauses (`SqlWikiPage.tsx:259-293`):** Every clause row in the alphabetical handbook table is a `<tr onClick={() => setActiveModalEntry(entry)}>` without a focusable `<button>`, `tabIndex={0}`, or `Enter`/`Space` key handler, blocking keyboard users from opening any clause specification modal.
  4. **Broken `<th>` Table Cell Display (`SqlWikiPage.tsx:248`):** `<th className="py-3 px-4 sm:px-6 flex items-center justify-between">` overrides `display: table-cell` with `display: flex` directly on the `<th>`, breaking native table border/height alignment against the first column `<th>`.
  5. **Unlabelled Search Input (`SqlWikiPage.tsx:198-216`):** The clause search `<input>` has no `<label>` or `aria-label`, and its `✕` clear button (`line 210`) has no `aria-label` and a tiny hit target (`p-1`).
  6. **Non-interactive Diagram Cards (`SqlExecutionDiagram.tsx:176-205`):** Logical pipeline steps use `<div onClick={() => setActiveStep(step.num)}>` without button semantics or keyboard support.
- **Recommended Fix:** Convert lesson rows in `TutorialListPage.tsx:260` to `<Link to={...}>` (or `<button type="button">`) with `focus-visible:ring-2 focus-visible:ring-noir-blood`; add `aria-expanded={!isCollapsed}` to module collapse buttons; add a focusable `<button>` inside each `SqlWikiPage.tsx` row (or `tabIndex={0}` + `onKeyDown` + `role="button"` on `<tr>`) and move `flex items-center justify-between` into an inner `<div>` inside `<th>`; add `aria-label` to the Wiki search input and clear button; convert `SqlExecutionDiagram.tsx:176` step cards to `<button type="button">`.

---

#### `ACAD-02` — `[VERIFIED]` 3-Tab Pedagogical Workspace (`TutorialDossierTab`, `TutorialInterrogationTab`, `TutorialSolveTab`) ignores `lang` for lesson content and hardcodes Vietnamese UI labels
- **Severity:** Critical
- **Effort:** M
- **File + Component:**
  - `fe/src/components/tutorial/TutorialDossierTab.tsx:74,129,135,150,193,196`
  - `fe/src/components/tutorial/TutorialInterrogationTab.tsx:88,123,157,161,192,214-215,222,224,261,265`
  - `fe/src/components/tutorial/TutorialSolveTab.tsx:71-74,123-126,131,143,148,176,178,185,187,194,220,270`
- **Primary Principle:** Consistency (Bilingual Completeness)
- **Secondary Principles:** Nielsen's Heuristics (Match Between System and the Real World)
- **What is wrong (Evidence):**
  - Although `tutorial.types.ts:43-144` defines English counterparts (`storyEn`, `naiveResultNoteEn`, `metaphorEn`, `explanationEn`, `questionEn`, `textEn`, `titleEn`, `flashcardEn`, `labelEn`, `descriptionEn`, `missionEn`, `level1ConceptEn`, `level2TemplateEn`, `summaryLinesEn`), the 3 pedagogical tab components unconditionally render `*Vi` fields and hardcoded Vietnamese chrome even when `lang === 'EN'`:
    - `TutorialDossierTab.tsx`: `casePain.storyVi` (`line 74`), `... và ... kẻ khác nữa.` (`line 129`), `casePain.naiveResultNoteVi` (`line 135`), `metaphor.metaphorVi` (`line 150`), `Mệnh đề:` (`line 193`), `selectedClause.explanationVi` (`line 196`).
    - `TutorialInterrogationTab.tsx`: `predictionQuiz.questionVi` (`line 88`), `opt.textVi` (`line 123`), `predictionQuiz.explanationVi` (`line 157`), `Thực tế SQLite trả về: ... kẻ.` (`line 161`), `b.titleVi` (`line 192`), `Hệ thống báo: ... Truy vấn trả về ... dòng (không khớp dữ liệu)!` (`lines 214-215`), `Thẻ nhớ 1 dòng:` (`line 222`), `b.flashcardVi` (`line 224`), `c.labelVi` (`line 261`), `c.descriptionVi` (`line 265`).
    - `TutorialSolveTab.tsx`: `SỔ TAY THÁM TỬ` (`line 71`), `⭐ Dễ / ⭐⭐ Vừa / ⭐⭐⭐ Khó / ⭐⭐⭐ BẪY` (`lines 123-126`), `ch.titleVi` (`lines 131,143`), `currentChallenge.missionVi` (`line 148`), `Tầng 1 (Khái niệm):` + `level1ConceptVi` (`lines 176,178`), `Tầng 2 (Khung điền khuyết):` + `level2TemplateVi` (`lines 185,187`), `Tầng 3 (Lời giải hoàn chỉnh):` (`line 194`), `'CHÍNH XÁC • PHÁ ÁN THÀNH CÔNG!' : 'KẾT QUẢ CHƯA KHỚP'` (`line 220`), and `takeawayFlashcard.summaryLinesVi` (`line 270`).
- **Recommended Fix:** Update `TutorialDossierTab.tsx`, `TutorialInterrogationTab.tsx`, and `TutorialSolveTab.tsx` to select `lang === 'VI' ? fieldVi : (fieldEn || fieldVi)` for all data fields and localize all remaining hardcoded Vietnamese UI strings.

---

#### `ACAD-03` — `[VERIFIED]` `dbRef.current` ref-mutation bug prevents Live Query table from rendering on initial load; missing WASM loading state & progress loading/error feedback
- **Severity:** Critical
- **Effort:** S
- **File + Component:**
  - `fe/src/pages/TutorialWorkspacePage.tsx:141,196-204,220-223,568-586`
  - `fe/src/components/tutorial/TutorialDossierTab.tsx:40-47,201-247`
  - `fe/src/pages/TutorialListPage.tsx:29-34`
- **Primary Principle:** Complete States (loading, error, ready) & Visibility of System Status (Nielsen #1)
- **Secondary Principles:** Interaction Feedback
- **What is wrong (Evidence):**
  1. **Silent Blank Live Query Table (`TutorialWorkspacePage.tsx:141,196-204,571` & `TutorialDossierTab.tsx:40-47`):** `TutorialWorkspacePage` stores the SQLite WASM instance in a `useRef` (`dbRef.current = db` inside `.then()` at `line 198`) and passes `db={dbRef.current}` as a prop to `TutorialDossierTab` (`line 571`). Because mutating `dbRef.current` does not trigger a React re-render, `TutorialDossierTab` receives `db = null` on initial mount and `liveResult` (`lines 40-47`) stays `null` even after SQLite finishes loading—leaving Section 3's "Live Filtered Table Result" (`lines 201-247`) completely blank until the user clicks a clause button!
  2. **No SQLite WASM Loading Indicator (`TutorialWorkspacePage.tsx:196-204,220-223`):** There is no `isDbLoading` state while `createSessionDb` initializes WASM. If a user clicks "Run" immediately, they receive a hardcoded English error toast `'Database is initializing, please wait...'` (`line 221`).
  3. **Silent Progress Fetch (`TutorialListPage.tsx:29-34`):** `useQuery(['tutorial_progress'])` ignores `isLoading` and `isError`, causing authenticated users' completion counts and progress bars to flash `0 / N` before jumping to the server values.
- **Recommended Fix:** Track `isDbReady` (or store `db` in state alongside `dbRef`) in `TutorialWorkspacePage.tsx` so `TutorialDossierTab` and `TutorialInterrogationTab` re-render as soon as SQLite WASM initializes, and disable/show a loading indicator on "Run" while `!isDbReady`; display a subtle skeleton/spinner for module progress in `TutorialListPage.tsx` while `isLoading` is true.

---

#### `ACAD-04` — `[VERIFIED]` "Reset" button in Tab 3 overwrites challenge-specific starter code with lesson-level starter query; WCAG contrast failure on Theory Run button; >115ch line lengths; sub-40px buttons & missing tab ARIA roles
- **Severity:** Major
- **Effort:** M
- **File + Component:**
  - `fe/src/pages/TutorialWorkspacePage.tsx:281-289,518-565,610-695,861-869,972-1057`
  - `fe/src/components/tutorial/TutorialTheorySection.tsx:64-144,227,245`
  - `fe/src/components/tutorial/TutorialSQLEditor.tsx:77-111`
  - `fe/src/components/tutorial/TutorialInterrogationTab.tsx:199,277`
  - `fe/src/components/tutorial/TutorialSolveTab.tsx:164`
  - `fe/src/pages/SqlWikiPage.tsx:98,107,367`
- **Primary Principle:** Interaction Feedback & User Control (Nielsen #3)
- **Secondary Principles:** Color Contrast (WCAG AA), Typography (45–75ch), Fitts's Law (≥40px), Accessibility (`role="tablist"`)
- **What is wrong (Evidence):**
  1. **Reset Restores Wrong Starter Code (`TutorialWorkspacePage.tsx:281-289`):** In 3-Tab mode, selecting Challenge 1–4 loads `challenge.starterCode` (`lines 156-159`). However, clicking "Reset" (`handleResetQuery`, `lines 281-289`) always resets `userCode` to `currentLesson.starterQuery` instead of the active challenge's `starterCode`.
  2. **WCAG AA Contrast Failure (`TutorialTheorySection.tsx:245`):** The "Run ⬇" button in Full Theory mode uses `text-noir-candle` (`#C9972C`) on `bg-noir-card/60` (`#E5D9BC`) — a **1.92:1** contrast ratio (fails WCAG AA 4.5:1).
  3. **Excessive Line Length (`TutorialTheorySection.tsx:227`):** Detailed theory text uses `max-w-5xl` (`1024px`) at `text-xs sm:text-sm`, resulting in **115–135ch** lines (violating 45–75ch).
  4. **Sub-40px Touch Targets & Missing Tab Roles:** Toolbar/action buttons across Academy force `h-6` (`24px`, `TutorialWorkspacePage.tsx:866`, `TutorialInterrogationTab.tsx:199,277`, `TutorialSolveTab.tsx:164`) and `h-7` (`28px`, `TutorialSQLEditor.tsx:82,95,107`, `TutorialTheorySection.tsx:120,139,170`). None of the tab strips (`TutorialWorkspacePage.tsx:518,610,972`, `TutorialTheorySection.tsx:64`, `SqlExecutionDiagram.tsx:105`) include `role="tablist"`, `role="tab"`, or `aria-selected`.
  5. **Token & Theme Drift in `SqlWikiPage.tsx` (`lines 33-43,98,107,367`):** Uses non-existent classes `bg-noir-parchmentDark` (`line 98`), `shadow-noir-md` (`line 107`), and `border-l-3` (`line 367`); styles the Execution Order banner (`line 107`) as a dark modern stone card (`from-[#1C1917] to-[#292524] rounded-xl`) that clashes with the parchment dossier theme; and shows a 9-step pipeline in `SqlWikiPage.tsx:33-43` vs a 6-step pipeline in `SqlExecutionDiagram.tsx:39-88`.
- **Recommended Fix:** Update `handleResetQuery` in `TutorialWorkspacePage.tsx:281` to check `currentLesson.tab3SolveCase?.challenges?.[currentChallengeIndex]?.starterCode` first; replace `text-noir-candle` on `TutorialTheorySection.tsx:245` with `text-noir-ink` or `text-amber-900`; constrain theory prose in `TutorialTheorySection.tsx:227` to `max-w-[70ch]`; increase button heights from `h-6`/`h-7` to at least `min-h-[36px] sm:min-h-[40px]` and add `role="tablist"`/`role="tab"`/`aria-selected`; replace invalid classes in `SqlWikiPage.tsx`.

---

### Area 3: Cases (`CaseListPage`, `CaseDetailPage`, `CaseCard`, `CaseSuccessModal`, `EvidenceBoard`, `HintPanel`, `ResultTable`, `SQLEditor`, `SubscribeModal`, `TableSchemaViewer`)

> **Note per Audit Rules:** The Cases area will be redesigned later; layout-specific findings are tagged **`[Superseded by Redesign]`**, while tokens, accessibility (a11y), interaction bugs, and states are fully reported below.

#### `CASE-01` — `[VERIFIED]` Keyboard-inaccessible `<div onClick>` CaseCards, missing ARIA attributes (`role="tablist"`, `aria-expanded`, `role="progressbar"`), unlabelled inputs, and sub-40px touch targets
- **Severity:** Critical
- **Effort:** M
- **File + Component:**
  - `fe/src/components/case/CaseCard.tsx:27-37,121-129`
  - `fe/src/pages/CaseListPage.tsx:43-51,182-192,197-213,418-433`
  - `fe/src/pages/CaseDetailPage.tsx:419-430,555-640,715-725`
  - `fe/src/components/case/EvidenceBoard.tsx:195-202,313-341`
  - `fe/src/components/case/TableSchemaViewer.tsx:128-150,284-300`
  - `fe/src/components/case/HintPanel.tsx:94-109`
- **Primary Principle:** Accessibility (Keyboard Navigation, Semantic HTML, ARIA, Form Labels)
- **Secondary Principles:** Fitts's Law (Target Size ≥ 40px), Interaction Feedback (`focus-visible`)
- **What is wrong (Evidence):**
  1. **Non-focusable `<div onClick>` Case Cards (`CaseCard.tsx:27-37`):** Every case card on `/cases` is a `<div onClick={() => onSelect(caseData)}>` without `<button>`/`<a>` semantics, `tabIndex={0}`, `onKeyDown`, or a `focus-visible` ring. Keyboard and screen-reader users cannot reach or open any case dossier. Additionally, the card's progress bar (`CaseCard.tsx:121-129`) lacks `role="progressbar"`, `aria-valuenow={progressPercent}`, `aria-valuemin={0}`, and `aria-valuemax={100}`.
  2. **Missing Filter Popover ARIA & Escape Key Dismissal (`CaseListPage.tsx:43-51,197-213`):** The filter trigger button (`line 197`) lacks `aria-expanded={isFilterOpen}` and `aria-haspopup="true"`, and `useEffect` (`lines 43-51`) only listens for `mousedown` outside—pressing `Escape` does not close the filter popover.
  3. **Unlabelled Search & Answer Inputs (`CaseListPage.tsx:182-192`, `CaseDetailPage.tsx:715-725`, `EvidenceBoard.tsx:195-202`):** None of these 3 `<Input>` / `<input>` fields provide a `<label>` or `aria-label` (relying solely on `placeholder`).
  4. **Missing Tab & Accordion ARIA (`CaseDetailPage.tsx:555-640`, `EvidenceBoard.tsx:331-340`, `TableSchemaViewer.tsx:128-150`):** The 5-tab workbench strip (`Results`, `Evidence`, `Schema`, `History`, `Notes` in `CaseDetailPage.tsx:555-640`) has no `role="tablist"`, `role="tab"`, `aria-selected`, or `role="tabpanel"`. The table expand/collapse button in `EvidenceBoard.tsx:331-340` has neither `aria-label`, `title`, nor `aria-expanded={isExpanded}`; `TableSchemaViewer.tsx:128` also lacks `aria-expanded={expanded}`.
  5. **Sub-40px Touch Targets:**
     - `CaseListPage.tsx:426`: Pagination page buttons are `w-8 h-8` (`32px × 32px`) and lack `aria-current={validCurrentPage === pageNum ? 'page' : undefined}`.
     - `CaseDetailPage.tsx:422`: Lead/Question switcher buttons are `w-6 h-6` (`24px × 24px`) and lack `aria-label` (`Lead 1`, `Lead 2`, etc.).
     - `HintPanel.tsx:97`: "Unseal Clue" button forces `h-7` (`28px`).
     - `EvidenceBoard.tsx:319,326,333` & `TableSchemaViewer.tsx:292,305`: Table/column action buttons use `p-1` (`20px–22px`) and lack `aria-label`.
- **Recommended Fix:** Render `CaseCard.tsx:27` as a semantic `<button type="button">` (or add `role="button" tabIndex={0} onKeyDown` + `focus-visible:ring-2 focus-visible:ring-noir-blood`) and add `role="progressbar"` attributes; add `aria-expanded` and `Escape` key handling to `CaseListPage.tsx` filter popover; add `aria-label` to all search/answer inputs and icon buttons; add `role="tablist"`/`role="tab"`/`aria-selected` to the workbench tabs; enlarge pagination, lead-switcher, and hint buttons to at least `min-h-[36px] sm:min-h-[40px]`.

---

#### `CASE-02` — `[VERIFIED]` `CaseDetailPage` misreports all 404/500/network errors as a hardcoded English "Premium Classified Dossier" paywall; hardcoded English toasts & spinner labels in Vietnamese mode
- **Severity:** Critical
- **Effort:** S
- **File + Component:**
  - `fe/src/pages/CaseDetailPage.tsx:126,133,141,181,217,219,244,266,270,283,288,308,310,317,343,349-366`
  - `fe/src/components/case/EvidenceBoard.tsx:393`
  - `fe/src/components/case/TableSchemaViewer.tsx:239,289`
- **Primary Principle:** Complete States (404 vs 403/No-Permission vs 500/Network Error) & Consistency (Bilingual i18n)
- **Secondary Principles:** Nielsen's Heuristics (#9 Help Users Recognize, Diagnose, and Recover from Errors)
- **What is wrong (Evidence):**
  1. **All Errors Misreported as Premium Paywall (`CaseDetailPage.tsx:349-366`):** Whenever `caseError || !caseData` is truthy—even if the user visited a non-existent URL like `/cases/99999` (`404 Not Found`), or the backend threw a `500 Internal Server Error` or network timeout—the page renders a hardcoded English paywall card: `"Access Restricted • Classified Dossier — This investigation file is strictly classified or requires Special Investigator clearance (Premium)"` with an `"Issue Clearance Now"` button that opens the VNPAY `SubscribeModal`, and no "Retry" button.
  2. **Hardcoded English Strings in Vietnamese Mode (`CaseDetailPage.tsx`):**
     - `line 343`: Loading spinner label is hardcoded `'DECIPHERING CRIME CASE DOSSIER...'`.
     - `lines 354-364`: Error/restricted card heading, body, and buttons (`'Return to Case Files'`, `'Issue Clearance Now'`) ignore `lang`.
     - `lines 133,141,181,217,219,244,266,270,283,288,308,310,317`: All 13 `toast` notifications in `CaseDetailPage` (except `line 126`) are hardcoded in English even when `lang === 'VI'`.
  3. **Minor Bilingual Leaks in Schema Viewers:** `EvidenceBoard.tsx:393` hardcodes `title={\`Ví dụ: \${col.sampleValues}\`}` in English mode, while `TableSchemaViewer.tsx:289` hardcodes `'column name'` in Vietnamese mode.
- **Recommended Fix:** In `CaseDetailPage.tsx:349-366`, inspect the HTTP status code: render the Premium `SubscribeModal` prompt **only** when `status === 403` (or `SubscriptionNotPurchased`), render a localized "Case Not Found" state when `status === 404`, and render a localized "Connection / Server Error" card with a `refetchCase()` Retry button for all other errors; localize all spinner labels and `toast` messages using `lang`.

---

#### `CASE-03` — `[VERIFIED]` Clicking `+` or Foreign Key links in `EvidenceBoard` generates invalid double-wrapped SQL; "Clear Search Filters" on `CaseListPage` fails to reset `statusFilter`; duplicate button actions in `CaseSuccessModal`; missing empty states in `EvidenceBoard` & `TableSchemaViewer`
- **Severity:** Major
- **Effort:** S
- **File + Component:**
  - `fe/src/pages/CaseDetailPage.tsx:129-136,657-663` & `fe/src/components/case/EvidenceBoard.tsx:221-228,256-439,314-318`
  - `fe/src/pages/CaseListPage.tsx:463-478`
  - `fe/src/components/case/CaseSuccessModal.tsx:97-106`
  - `fe/src/components/case/TableSchemaViewer.tsx:82-84`
- **Primary Principle:** Nielsen's Heuristics (#5 Error Prevention, #3 User Control, #4 Consistency) & Complete States (Empty States)
- **Secondary Principles:** Interaction Feedback
- **What is wrong (Evidence):**
  1. **Broken Double-Wrapped SQL Injection from `EvidenceBoard` (`CaseDetailPage.tsx:129-136` + `EvidenceBoard.tsx:225-227,316`):**
     - `CaseDetailPage.tsx:129-131` defines `handleInsertTableQuery(tableName: string)` which sets `setSqlQuery(\`SELECT * FROM \${tableName} LIMIT 10;\\n\`)`.
     - While `TableSchemaViewer.tsx:175` correctly passes `table.tableName`, `EvidenceBoard.tsx:316` passes a full SQL statement `onInsertTableQuery(\`SELECT * FROM \${table.tableName} LIMIT 10;\`)`, and `EvidenceBoard.tsx:225-227` (because `CaseDetailPage.tsx:657-663` does not pass `onInsertJoinSnippet`) also calls `onInsertTableQuery(\`SELECT * FROM \${rel.fromTable} JOIN ...\`)`.
     - Result: clicking `+` or a Foreign Key pill in `EvidenceBoard` overwrites the editor with broken syntax: `SELECT * FROM SELECT * FROM suspects LIMIT 10; LIMIT 10;`!
  2. **Incomplete Filter Reset & Misleading Empty Message (`CaseListPage.tsx:463-478`):**
     - When a user filters by `statusFilter = 'SOLVED'` (with an empty `searchQuery`) and has 0 solved cases, `CaseListPage.tsx:464-466` displays `Không có hồ sơ nào trùng khớp với từ khóa tìm kiếm ""` (`No case records match your query keyword ""`).
     - Worse, clicking `"Xóa Bộ Lọc Tìm Kiếm"` / `"Clear Search Filters"` (`lines 472-475`) calls `setSearchQuery('')` and `setSelectedDifficulty('ALL')`, **omitting `setStatusFilter('ALL')`**—so clicking the button does nothing and leaves the user trapped on the empty screen!
  3. **Duplicate Action Buttons in `CaseSuccessModal` (`CaseSuccessModal.tsx:97-106`):**
     - When the final question of a case is solved (`!hasNextQuestion`), two distinct buttons are shown: `"Quay Lại Hồ Sơ Vụ Án"` (`Return to Case Files`) and `"Ghi Vào Sổ Tay Quân Số"` (`Record in Personnel Dossier`). Both buttons bind `onClick={onBackToCases}` (`/cases`), even though `"Record in Personnel Dossier"` implies navigating to `/profile`.
  4. **Missing Empty States (`EvidenceBoard.tsx:256-439`, `TableSchemaViewer.tsx:82-84`):**
     - Filtering `EvidenceBoard` to 0 matching tables renders an empty grid with no message; when `tables.length === 0`, `TableSchemaViewer.tsx:82-84` returns `null` (rendering a completely blank tab panel).
- **Recommended Fix:** Pass `table.tableName` from `EvidenceBoard.tsx:316` (or let `handleInsertTableQuery` accept either a table name or full query / wire `onInsertJoinSnippet` in `CaseDetailPage.tsx:657`); add `setStatusFilter('ALL')` to `CaseListPage.tsx:472-475` and adjust the empty-state copy when `searchQuery === ''`; route the second button in `CaseSuccessModal.tsx:102` to `/profile` (or remove the duplicate button); add explicit empty states to `EvidenceBoard` and `TableSchemaViewer`.

---

#### `CASE-04` — `[VERIFIED]` 15+ hardcoded hex colors & `rounded-xl` off-theme overrides in `EvidenceBoard`, stark `bg-white` in `SQLEditor`, invalid classes (`shadow-noir-xs`, `py-0.2`), and WCAG AA contrast failures (`2.08:1`–`3.78:1`)
- **Severity:** Major
- **Effort:** M
- **File + Component:**
  - `fe/src/components/case/EvidenceBoard.tsx:159,160,171,173,178,200,208,235,275,278,289,291,299,319,326,333,348,356,368,387,392,406,428`
  - `fe/src/components/case/SQLEditor.tsx:116,128,172`
  - `fe/src/components/case/CaseCard.tsx:93,96,135`
  - `fe/src/pages/CaseListPage.tsx:428`
  - `fe/src/pages/CaseDetailPage.tsx:443-445,499`
  - `fe/src/components/case/CaseSuccessModal.tsx:80`
  - `fe/src/components/case/HintPanel.tsx:119`
  - `fe/src/components/case/ResultTable.tsx:37,75,125`
  - `fe/src/components/case/SubscribeModal.tsx:80`
  - `fe/src/components/case/TableSchemaViewer.tsx:145,179,190,191,238`
- **Primary Principle:** Color System (WCAG AA Contrast & Token Consistency)
- **Secondary Principles:** Theme Coherence
- **What is wrong (Evidence):**
  1. **WCAG AA Contrast Failures in Cases:**
     - `CaseCard.tsx:93,96`: Badge reward pill uses `text-noir-candle` (`#C9972C`) on `bg-noir-parchment/60` (`#EDE3C9`) → **2.08:1** (fails 3:1 UI & 4.5:1 text).
     - `CaseCard.tsx:135`, `CaseDetailPage.tsx:443-445`, `CaseSuccessModal.tsx:80`, `ResultTable.tsx:125`, `SQLEditor.tsx:172`, `SubscribeModal.tsx:80`, `TableSchemaViewer.tsx:179,191,238`: Use `text-noir-candleDark` (`#A67818`) on `bg-noir-card` (`#E5D9BC`) → **2.86:1** or on `bg-noir-paper` (`#EDE3C9`) → **3.11:1** (fails 4.5:1 for `9px–14px` text).
     - `ResultTable.tsx:37` (`NULL` cells) & `EvidenceBoard.tsx:200,368,392`: Use `text-noir-inkFaint` (`#7A6B58`) on parchment/card surfaces → **3.30:1–3.78:1** (fails 4.5:1 for `9px–12px` text).
  2. **Hardcoded Hex Proliferation & `rounded-xl` Drift in `EvidenceBoard.tsx`:** Uses 15 hardcoded hexes (`#EDE3C9`, `#C4B6A0`, `#8C7E6D`, `#A8987E`, `#E8DCBF`, `#F5ECD7`, `#DFD3B5`, `#9A8870`, `#E2D5B8`, `#EFE5CE`, `#E5D9BC`, `#EADEC6`, `#E8DCC2`, `#D5C7AF`, `#1A1612`) and `rounded-xl` / `rounded-lg` instead of `noir.*` tokens and `rounded-[3px]`/`rounded-[4px]`. `CaseDetailPage.tsx:499`, `HintPanel.tsx:119`, `ResultTable.tsx:75`, and `TableSchemaViewer.tsx:190` also hardcode `bg-[#FAF6EC]`.
  3. **Stark White Editor Surface (`SQLEditor.tsx:116,128`):** Uses `bg-white` (`#FFFFFF`) inside the warm `#EDE3C9` dossier frame, creating harsh luminance glare and breaking the aged-paper forensic aesthetic (unlike `TutorialSQLEditor.tsx` which uses a cohesive theme).
  4. **Invalid Tailwind Utilities:** `CaseListPage.tsx:428` uses undefined `shadow-noir-xs`; `EvidenceBoard.tsx:299` and `TableSchemaViewer.tsx:145,238` use invalid `py-0.2`.
- **Recommended Fix:** Darken `noir.candleDark` to `#6E4D0B` (`5.35:1`) and `noir.inkFaint` to `#5C4E3C` (`5.62:1`) in `tailwind.config.js`; replace `text-noir-candle` on light backgrounds with `text-noir-candleDark`; replace hardcoded hexes in `EvidenceBoard`, `CaseDetailPage`, `HintPanel`, `ResultTable`, and `TableSchemaViewer` with semantic `noir.*` tokens (including a new `noir.paperLight: '#FAF6EC'` token); style `SQLEditor.tsx` with warm parchment (`bg-[#FAF6EC]` or dark terminal theme consistent with `TutorialSQLEditor`); replace `py-0.2` with `py-0.5`.

---

#### `CASE-05` — `[VERIFIED]` `[Superseded by Redesign]` Cases workspace & list layout issues (non-sticky split columns, schema hidden on query execution, 1-line title truncation)
- **Severity:** Minor *(Tagged **`[Superseded by Redesign]`** per instructions)*
- **Effort:** L
- **File + Component:**
  - `fe/src/pages/CaseDetailPage.tsx:197,462-754`
  - `fe/src/pages/CaseListPage.tsx:63-65,98-122,367`
  - `fe/src/components/case/CaseCard.tsx:83`
- **Primary Principle:** Visual Hierarchy & Layout / Workspace Ergonomics
- **Secondary Principles:** Recognition Rather Than Recall (Nielsen #6)
- **What is wrong (Evidence):**
  1. **Unbounded Document Scroll in 2-Column Split (`CaseDetailPage.tsx:462-754`) `[Superseded by Redesign]`:** Unlike `TutorialWorkspacePage` (which locks to `h-screen overflow-hidden` with independent scrollable panes), `CaseDetailPage` renders in normal document flow. When a user expands tables in `TableSchemaViewer` or views `EvidenceBoard`, the right column grows tall, forcing vertical page scrolling between the Question/Hints on the left, the SQL Editor at top-right, and the Submit Answer box at bottom-right.
  2. **Schema Hidden When Running Query (`CaseDetailPage.tsx:197,555-640`) `[Superseded by Redesign]`:** Because `ResultTable`, `EvidenceBoard`, and `TableSchemaViewer` share the same single tab container (`activeWorkbenchTab`), executing a query (`line 197`) forces `setActiveWorkbenchTab('result')`, immediately hiding the schema/columns the user was referencing.
  3. **Single-Line Case Title Truncation (`CaseCard.tsx:83`) `[Superseded by Redesign]`:** `line-clamp-1` on `CaseCard` titles in a 4-column grid (`CaseListPage.tsx:367`) truncates Vietnamese case titles after ~22 characters even when vertical space is available.
- **Recommended Fix:** *(Defer to Cases Redesign)* Adopt a locked viewport split-pane layout (`h-screen`) with persistent schema access alongside the SQL editor and `line-clamp-2` on case card titles.

---

## 3. Design-Token Inconsistencies & Proposed Unified Token Set

### 3.1 Audit of Token Duplication, Hardcoded Hexes & Phantom Utilities

#### A. Triplicated & Redundant Color Tokens (`fe/tailwind.config.js:10-76`)
Currently, `tailwind.config.js` defines **46 color keys** across 3 namespaces (`noir`, `detective`, `police`) that map to the exact same **14 unique hex values**:
- `#E2D5B8` → `noir.desk`, `detective.bg`, `police.950`
- `#EDE3C9` → `noir.parchment`, `noir.paper`, `detective.surface`, `police.900`
- `#E5D9BC` → `noir.paperDark`, `noir.card`, `detective.surfaceElevated`, `police.800`
- `#DCD0B4` → `noir.cardHover`, `detective.folder`, `police.700`
- `#C4B6A0` → `noir.border`, `detective.border`, `police.600`
- `#9A8870` → `noir.borderDark`, `detective.borderStrong`, `police.500`
- `#1A1612` → `noir.ink`, `detective.ink`, `police.100`
- `#4A3E30` → `noir.inkMuted`, `noir.muted`, `detective.textMuted`
- `#7A6B58` → `noir.inkFaint` *(WCAG fail: 3.78:1 on `#EDE3C9`)*
- `#8B1A1A` → `noir.wax`, `noir.blood`, `detective.crimson`, `detective.danger`
- `#6D1212` → `noir.waxDark`, `noir.bloodDark`, `detective.crimsonDark`
- `#C9972C` → `noir.amber`, `noir.candle`, `detective.gold`, `detective.warning` *(WCAG fail: 2.08:1 on `#EDE3C9`)*
- `#A67818` → `noir.amberDark`, `noir.candleDark`, `detective.goldDark` *(WCAG fail: 2.86:1 on `#E5D9BC`)*
- `#E8BA4F` → `noir.amberLight`, `noir.candleLight`, `detective.goldLight`
- `#2A4B2A` → `noir.stamp`, `noir.stampGreen`, `detective.success`
- `#3D5A3D` → `noir.stampLight`

#### B. Hardcoded Hex Colors Scattered in JSX (`fe/src/**`)
| Hardcoded Hex | Files & Line Numbers | Semantic Role / Replacement Token |
| :--- | :--- | :--- |
| `#FAF6EC`, `#FCF9F2`, `#FBF7EE`, `#FAF2DF`, `#F7EFE0` | `ProfilePage.tsx:160,213,340,348`, `CertificatePage.tsx:140,214`, `LeaderboardPage.tsx:47,91,136,181,184,193`, `PostListPage.tsx:81,148,290`, `PostDetailPage.tsx:166,188,227,357`, `PostEditorPage.tsx:136,154,228`, `AdminPostModerationPage.tsx:86`, `DetectiveRanksAndBadges.tsx:289`, `CaseDetailPage.tsx:499`, `HintPanel.tsx:119`, `ResultTable.tsx:75`, `TableSchemaViewer.tsx:190` | Warm Ivory / Elevated Paper → `noir.paperLight` (`#FAF6EC`) |
| `#F5ECD7`, `#EFE5CE`, `#E8DCBF`, `#DFD3B5`, `#EADEC6`, `#E8DCC2`, `#D5C7AF` | `EvidenceBoard.tsx:171,200,208,275,289,348,387` | Existing `noir.paper` (`#EDE3C9`), `noir.card` (`#E5D9BC`), `noir.border` (`#C4B6A0`) |
| `#8C7E6D` | `PostListPage.tsx:260,310`, `PostDetailPage.tsx:147`, `EvidenceBoard.tsx:160` | Muted/Faint Ink → darkened `noir.inkFaint` (`#5C4E3C`) |
| `#3D2B1F`, `#5A4535`, `#EBE0C7` | `CertificatePage.tsx:145,153` | Dark Wood Frame → `noir.wood` (`#3D2B1F`) / `noir.border` |
| `#1C1917`, `#292524`, `#1E1A17`, `#2B2520`, `#181411`, `#26201B` | `DetectiveRanksAndBadges.tsx:230,368`, `SqlWikiPage.tsx:107` | Off-theme dark-SaaS cards → replace with `noir.paper` / `noir.card` dossier styling |

#### C. Phantom / Invalid Classes in Active Use
- **Undefined Shadows:** `shadow-noir-xs`, `shadow-noir-md`, `shadow-noir-lg` (used 20+ times across `LandingPage`, `ProfilePage`, `LeaderboardPage`, `CertificatePage`, `NotFoundPage`, `Post*Page`, `GoogleAuthButton`, `SqlWikiPage`, `CaseListPage`).
- **Undefined Colors:** `bg-noir-parchmentDark` (`SqlWikiPage.tsx:98`).
- **Undefined Animations:** `animate-fadeIn` (`QueryHistoryPanel.tsx:315`, `DetectiveRanksAndBadges.tsx:289,380,449,459`).
- **Invalid Tailwind Utilities:** `border-3` (`router/index.tsx:26`, `PostDetailPage.tsx:153`), `border-l-3` (`SqlWikiPage.tsx:367`), `py-0.2` (`QueryHistoryPanel.tsx:180,189`, `EvidenceBoard.tsx:299`, `TableSchemaViewer.tsx:145,238`), `backdrop-blur-xs` (`QueryHistoryPanel.tsx:316`).

---

### 3.2 Proposed Unified Token Set (`fe/tailwind.config.js` & `fe/index.html`)

```js
// Proposed unified theme extension in fe/tailwind.config.js
theme: {
  extend: {
    colors: {
      noir: {
        desk: '#E2D5B8',         // 60% App canvas background
        paper: '#EDE3C9',        // Primary dossier surface (alias: parchment)
        parchment: '#EDE3C9',
        paperLight: '#FAF6EC',   // Highlighted ivory inset / inner reading sheet
        card: '#E5D9BC',         // 30% Secondary card / recessed tab surface (alias: paperDark, parchmentDark)
        paperDark: '#E5D9BC',
        parchmentDark: '#E5D9BC',
        cardHover: '#DCD0B4',    // Interactive hover surface
        border: '#C4B6A0',       // Subtle divider rule
        borderDark: '#9A8870',   // Structural 2px dossier frame border
        ink: '#1A1612',          // Primary body text (12.8:1 on paper)
        inkMuted: '#4A3E30',     // Secondary text (7.4:1 on paper) (alias: muted)
        muted: '#4A3E30',
        inkFaint: '#5C4E3C',     // Darkened from #7A6B58 -> 5.62:1 WCAG AA pass on #EDE3C9 & 5.10:1 on #E5D9BC
        blood: '#8B1A1A',        // 10% Primary crimson stamp / danger / CTA (6.3:1 on paper) (alias: wax)
        wax: '#8B1A1A',
        bloodDark: '#6D1212',    // Hover/active crimson (alias: waxDark)
        waxDark: '#6D1212',
        candle: '#C9972C',       // Decorative gold fill / icon accent ONLY (do not use for small text on light bg) (alias: amber)
        amber: '#C9972C',
        candleDark: '#6E4D0B',   // Darkened from #A67818 -> 5.35:1 WCAG AA pass on #EDE3C9 & 4.85:1 on #E5D9BC (alias: amberDark)
        amberDark: '#6E4D0B',
        candleLight: '#E8BA4F',  // Gold highlight on dark surfaces (alias: amberLight)
        amberLight: '#E8BA4F',
        stamp: '#2A4B2A',        // Approved / Solved forest green (6.8:1 on paper) (alias: stampGreen)
        stampGreen: '#2A4B2A',
        stampLight: '#3D5A3D',
      },
    },
    fontFamily: {
      // Max 2 font families with full Vietnamese diacritics support:
      display: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      serif: ['"Be Vietnam Pro"', 'Georgia', 'serif'],
      sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      typewriter: ['"IBM Plex Mono"', 'monospace'], // Distinct Vietnamese-capable monospace for stamps/dockets
      mono: ['"IBM Plex Mono"', 'monospace'],
    },
    boxShadow: {
      'noir-xs': '1px 1px 0px rgba(26, 22, 18, 0.10)',
      'noir-sm': '2px 2px 0px rgba(26, 22, 18, 0.12)',
      'noir-card': '3px 3px 0px rgba(26, 22, 18, 0.15), 0 1px 3px rgba(0, 0, 0, 0.06)',
      'noir-md': '4px 4px 0px rgba(26, 22, 18, 0.16), 0 2px 6px rgba(0, 0, 0, 0.08)',
      'noir-lift': '5px 5px 0px rgba(26, 22, 18, 0.20), 0 4px 12px rgba(0, 0, 0, 0.10)',
      'noir-lg': '6px 6px 0px rgba(26, 22, 18, 0.22), 0 8px 20px rgba(0, 0, 0, 0.12)',
      'noir-modal': '6px 6px 0px rgba(26, 22, 18, 0.25), 0 12px 32px rgba(0, 0, 0, 0.22)',
    },
  },
}
```

---

## 4. Prioritized Fix Plan

### Phase A: Quick Wins (Effort `S` — High Impact, Low Risk, <30 min each)
1. **`COM-03` (Critical, S):** Darken `noir.candleDark` / `amberDark` (`#6E4D0B`) and `noir.inkFaint` (`#5C4E3C`) in `tailwind.config.js`, and replace `text-noir-amber`/`text-noir-candle` on light surfaces (`Navbar.tsx`, `Badge.tsx`, `TutorialTheorySection.tsx`, `CaseCard.tsx`) with `text-noir-candleDark` to immediately pass WCAG AA 4.5:1 across the entire app.
2. **`COM-02` (Major, S):** Remove unused `Playfair Display` & `Source Serif 4` from `fe/index.html`, add `1,900` italic weight to `Be Vietnam Pro`, map `font-typewriter` to `IBM Plex Mono` in `tailwind.config.js`, and sync `document.documentElement.lang` with `languageStore`.
3. **`COM-04` (Critical, S):** Add a visible `VI / EN` language toggle to `Navbar.tsx` (desktop and mobile) and add `/posts` (`Hồ Sơ Báo Cáo` / `Dispatches`) to the mobile unauthenticated menu.
4. **`COM-05` (Major, S):** Change `Navbar.tsx` desktop nav breakpoint from `sm:` (`640px`) to `lg:` (`1024px`), increase action button heights to `min-h-[40px]`, and add `aria-label` + `aria-expanded` to the mobile hamburger button.
5. **`COM-07` (Major, S):** Add a global `@media (prefers-reduced-motion: reduce)` rule in `fe/src/index.css` and `useReducedMotion` support in `AnimatedPage.tsx`, `StampBadge.tsx`, and `TypewriterText.tsx`.
6. **`ACAD-03` (Critical, S):** Fix the `dbRef.current` ref-mutation bug in `TutorialWorkspacePage.tsx` by tracking `db` / `isDbReady` in React state so `TutorialDossierTab` renders its Live Query table immediately on mount, and show a loading state while SQLite WASM initializes.
7. **`CASE-02` (Critical, S):** Differentiate `403` (Premium paywall) from `404` (Case Not Found) and `500`/network errors (with Retry button) in `CaseDetailPage.tsx:349-366`, and localize all hardcoded English spinner/toast strings.
8. **`CASE-03` (Major, S):** Fix the broken double-wrapped `SELECT * FROM SELECT * FROM ...` SQL injection in `EvidenceBoard.tsx:225,316`, add `setStatusFilter('ALL')` to `CaseListPage.tsx:472` "Clear Search Filters", and fix the duplicate button action in `CaseSuccessModal.tsx:102`.
9. **`COM-12` (Minor, S):** Replace misleading `01–04` sequence numbers on `LandingPage.tsx` audience cards and remove `sm:whitespace-nowrap` on the hero headline.

### Phase B: Medium Refactors (Effort `M` — Component & Page-Level Fixes, <Half Day each)
1. **`COM-01` & `CASE-04` (Major, M):** Register missing shadow (`noir-xs`, `noir-md`, `noir-lg`), color (`paperLight`, `parchmentDark`), and animation (`fadeIn`) tokens in `tailwind.config.js`; fix invalid utilities (`border-3`, `border-l-3`, `py-0.2`, `backdrop-blur-xs`); replace hardcoded hexes in `EvidenceBoard.tsx` and warm the `SQLEditor.tsx` background.
2. **`COM-06` (Critical, M):** Upgrade `Modal.tsx` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trapping, focus restoration, and localized close button `aria-label`; refactor `QueryHistoryPanel.tsx` `SnapshotModal` to use `Modal.tsx` and replace `window.confirm`.
3. **`ACAD-01` & `CASE-01` (Critical, M):** Restore full keyboard accessibility (`<button>`/`<Link>`, `focus-visible` rings, `aria-expanded`, `role="tablist"`, `role="progressbar"`, input `aria-label`s, and ≥40px touch targets) across `TutorialListPage`, `SqlWikiPage`, `SqlExecutionDiagram`, `CaseCard`, `CaseListPage`, `CaseDetailPage`, `EvidenceBoard`, and `TableSchemaViewer`.
4. **`ACAD-02` (Critical, M):** Wire bilingual `lang === 'VI' ? *Vi : (*En || *Vi)` selection and localized UI labels across `TutorialDossierTab.tsx`, `TutorialInterrogationTab.tsx`, and `TutorialSolveTab.tsx`.
5. **`COM-08` & `COM-09` (Critical, M):** Add top return-home & language bar to Auth/404 pages, fix `tabIndex={-1}` on `ResetPasswordPage` password toggle, use `useId()` in `Input.tsx`, convert `ProfilePage` avatar uploader to a keyboard/touch-accessible `<button>`, fix `LeaderboardPage` loading vs empty state, add `user_progress` loading/error states on `ProfilePage` & `CertificatePage`, and fix 360px overflow on `CertificatePage`.
6. **`COM-10`, `COM-11` & `ACAD-04` (Major, M):** Align `DetectiveRanksAndBadges.tsx` and `SqlWikiPage.tsx` with the parchment dossier theme and `<button>` semantics; localize remaining Vietnamese strings on `Post*Page` & `MarkdownViewer`, constrain prose line width to `65ch–70ch`, add no-permission state on `AdminPostModerationPage`, and fix `handleResetQuery` in `TutorialWorkspacePage.tsx`.

### Phase C: Larger Architectural / Layout Refactors (Effort `L` — >Half Day)
1. **`CASE-05` (`[Superseded by Redesign]`, L):** Full Cases workspace & list layout redesign (locked viewport split-pane workspace with persistent schema access alongside the SQL editor).

---

## 5. Recommended First Batch of Issue IDs for Phase 2

To deliver the highest UX, accessibility, bilingual, and bug-fix impact with clean, isolated commits on the presentation layer, I recommend starting **Phase 2** with this **First Batch (11 Issue IDs)**:

1. **Foundation, Tokens, Contrast, Typography & Reduced Motion:**
   - `COM-01` (Unified `tailwind.config.js` tokens, missing `shadow-noir-*`, invalid utility fixes)
   - `COM-02` (Font family cleanup, `IBM Plex Mono` for `font-typewriter`, Vietnamese `900 italic`, `<html lang>` sync)
   - `COM-03` (WCAG AA contrast fixes for `candleDark`, `candle`, and `inkFaint`)
   - `COM-07` (`prefers-reduced-motion` support across CSS & motion components)
2. **Global Navigation, Language Switcher & Modal Accessibility:**
   - `COM-04` (Global `VI / EN` switcher in `Navbar` + `/posts` in mobile unauthenticated menu)
   - `COM-05` (`Navbar` `lg:` tablet breakpoint fix, ≥40px touch targets, hamburger ARIA)
   - `COM-06` (`Modal.tsx` `role="dialog"`, `aria-modal`, focus trap, and `QueryHistoryPanel` modal fix)
3. **Critical Functional, Bilingual & Keyboard Blockers in Academy & Cases:**
   - `ACAD-01` (Keyboard-accessible lesson rows in `TutorialListPage`, `SqlWikiPage` table/row fix, `SqlExecutionDiagram` buttons)
   - `ACAD-02` (Bilingual `EN`/`VI` support in `TutorialDossierTab`, `TutorialInterrogationTab`, `TutorialSolveTab`)
   - `ACAD-03` (Fix `dbRef.current` blank Live Query table bug + SQLite WASM loading state)
   - `CASE-01`, `CASE-02`, `CASE-03` (Keyboard-accessible `CaseCard` & Cases controls, proper `403` vs `404` vs `500` error states in `CaseDetailPage`, and fix for the broken `SELECT * FROM SELECT * FROM` SQL insertion in `EvidenceBoard` and `CaseListPage` filter reset)

