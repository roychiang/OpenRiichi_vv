# WebGL Riichi Mahjong - 實施計畫與任務分解

## 時程概覽與里程碑
-   **總工期**：約 10 週
-   **主要里程碑**：
    -   **Alpha 版本**（第6週）：核心玩法完整，基本連線功能正常
    -   **Beta 版本**（第8週）：社交功能完整，AI系統整合，基本優化完成
    -   **Release 版本**（第10週）：性能優化完成，通過壓力測試，準備正式發布
-   **階段**：原型 -> 核心玩法 -> 後端整合 -> 社交/AI -> 優化發布

## Phase 1: 專案建置與原型 (Weeks 1-2)
**目標**：建立基礎建設，跑通「渲染」與「連線」的最小可行性 (MVP)。

-   [ ] **Frontend Setup**:
    -   初始化 Vite + React + TypeScript 專案。
    -   設置 React Three Fiber (R3F) 場景。
    -   導入基礎麻將牌模型 (.glb/.gltf)。
-   **Backend Setup**:
    -   Docker 化現有的 Vala Game Server。
    -   建立 Node.js Gateway 基礎框架，實現 WebSocket <-> TCP 轉發。
-   **Proof of Concept (PoC)**:
    -   實現簡單的「發牌 -> 渲染手牌」流程。

## Phase 2: 核心玩法實作 (Weeks 3-5)
**目標**：完成單局麻將的完整流程（發牌、摸打、吃碰槓胡、流局）。

-   [ ] **3D Interaction**:
    -   實現滑鼠/觸控的牌選取與打牌動畫。
    -   製作吃碰槓胡的 UI Overlay。
-   **Game Logic Sync**:
    -   前端狀態機對接後端協議。
    -   處理同步問題（延遲、斷線重連）。
-   **Audio**:
    -   整合音效（打牌聲、叫聲）與背景音樂。

## Phase 3: Viverse 整合與後端服務 (Weeks 4-6)
**目標**：完成帳號系統、資料持久化與經濟系統。

-   [ ] **Viverse Auth**:
    -   實作 OAuth2 / OIDC 登入流程。
    -   獲取並顯示 User Profile & Avatar。
-   **Database & API**:
    -   設計 Supabase Schema (Users, Games, Transactions)。
    -   實作 Leaderboard API。
    -   實作籌碼結算邏輯。

## Phase 4: 社交與 AI 系統 (Weeks 7-8)
**目標**：加入聊天、語音、AI 補位與 LLM 接口。

-   [ ] **Lobby & Matchmaking**:
    -   製作大廳介面與房間列表。
    -   實作 20 秒自動開始倒數邏輯。
-   **Social**:
    -   整合 WebRTC 語音通話 (PeerJS/LiveKit)。
    -   實作文字聊天室。
-   **AI & Bots**:
    -   整合後端 Bot 邏輯，實現自動補位。
    -   開發斷線託管機制。
-   **LLM Hook**:
    -   定義 Agent API 規範 (JSON Schema)。
    -   實作 Gateway 的 Agent 轉發層。

## Phase 5: 優化、測試與部署 (Weeks 9-10)
**目標**：性能優化、壓力測試與雲端部署。

-   [ ] **Optimization**:
    -   3D 模型與貼圖壓縮 (Draco)。
    -   React 渲染效能優化 (useMemo, React.memo)。
-   **Testing**:
    -   單元測試 (Logic)。
    -   集成測試 (WebSocket Flows)。
    -   壓力測試 (模擬 100+ 連線)。
-   **Deployment**:
    -   編寫 Docker Compose 與 K8s YAML。
    -   部署至雲端 (AWS/GCP/Viverse Cloud)。

## 分支策略與 CI/CD 流程 (Branching & CI/CD)

### 1. 分支管理策略 (Git Flow)
-   **`main` (Production)**:
    -   穩定發布分支，對應 VIVERSE/Zeabur 正式環境。
    -   僅接受從 `dev` 或 `hotfix/*` 的 Pull Request (PR)。
    -   **保護規則**: 需通過所有測試，且經 Code Review 批准。
-   **`dev` (Staging/Integration)**:
    -   日常開發集成分支，對應 Zeabur Staging 環境。
    -   開發者將功能合併至此進行整合測試。
-   **`feature/*`**:
    -   功能開發分支 (e.g., `feature/viverse-login`, `feature/3d-table`).
    -   從 `dev` 切出，完成後發 PR 回 `dev`。
-   **`hotfix/*`**:
    -   緊急修復分支，從 `main` 切出，修復後同時合併回 `main` 與 `dev`。

### 2. CI/CD Pipeline (GitHub Actions)
-   **Workflow 1: Feature Validation (PR to `dev` / `feature/*`)**
    -   **Trigger**: Push to `feature/*` or PR to `dev`.
    -   **Jobs**:
        -   Linting (ESLint, Prettier).
        -   Type Check (TypeScript).
        -   Unit Tests (Frontend: Vitest, Backend: `meson test`).
-   **Workflow 2: Staging Deployment (Push to `dev`)**
    -   **Trigger**: Push/Merge to `dev`.
    -   **Jobs**:
        -   Build Docker Images (Gateway, GameServer).
        -   Deploy to Zeabur (Staging Project).
        -   **Integration Test**: 觸發 Headless Bot 測試腳本，驗證 Staging 環境連線與基本對局。
-   **Workflow 3: Production Release (Push to `main`)**
    -   **Trigger**: Push/Merge to `main` (Tag Release).
    -   **Jobs**:
        -   Full Regression Test.
        -   Build & Push Production Docker Images.
        -   Deploy to Zeabur (Production Project).
        -   Deploy Frontend to VIVERSE Hosting.

## 測試計畫
### 1. 自動化測試 (Automated Testing)
-   **Local Server Test (Headless Bot)**:
    -   利用現有的 `SimpleBot` 或 `NullBot` 邏輯。
    -   編寫測試腳本 (Test Runner)，啟動本地 Docker Server。
    -   模擬 4 個 Bot 連入同一桌，快速執行一局遊戲 (Time Scale x10)。
    -   **驗證點**：Server 是否崩潰、分數結算是否正確、牌譜是否生成。
    -   整合至 CI/CD Pipeline (GitHub Actions)。
-   **Unit Test**:
    -   使用 `meson test` 執行 `HandTests.vala` (牌理邏輯測試)。

### 2. 手動測試
-   **功能測試**：QA 手動測試所有遊戲流程與異常狀況（斷線、重連）。
-   **相容性測試**：Chrome, Firefox, Safari (Desktop/Mobile)。

### 3. 負載測試
-   使用腳本模擬 25 桌併發，監控 Server CPU/Memory。

## 資源需求
### 美術資源
-   **3D 模型**：麻將桌、麻將牌、牌桌環境、玩家角色模型
-   **UI 設計**：介面圖標、按鈕、背景、特效貼圖
-   **動畫資源**：發牌動畫、胡牌特效、角色動作
-   **預估工時**：2-3 週，需要 1 名 3D 美術設計師

### 音效資源
-   **背景音樂**：輕鬆愉快的麻將主題音樂
-   **音效**：打牌聲、吃碰槓胡音效、語音播報
-   **介面音效**：按鈕點擊、介面切換
-   **預估工時**：1-2 週，需要 1 名音效設計師

### 程式開發
-   **前端工程師**：2 名（React Three Fiber、遊戲邏輯、UI 實作）
-   **後端工程師**：1 名（遊戲伺服器、API 開發、資料庫設計）
-   **AI/演算法工程師**：1 名（難度調整、AI 邏輯）
-   **開發週期**：10 週

### 品質保證
-   **QA 測試工程師**：1 名
-   **測試週期**：貫穿整個開發週期，重點在第 6-10 週

## 品質保證與標準
### 性能指標
-   **渲染效能**：60 FPS 穩定運行（主流筆電與手機）
-   **載入時間**：初始載入 < 10 秒，場景切換 < 2 秒
-   **網路延遲**：操作回應 < 200ms
-   **記憶體使用**：< 500MB（桌面端），< 300MB（手機端）

### 錯誤容忍度
-   **嚴重錯誤（S級）**：0 個 - 導致遊戲崩潰或無法進行
-   **重大錯誤（A級）**：< 5 個 - 影響核心玩法或經濟系統
-   **一般錯誤（B級）**：< 20 個 - 影響使用者體驗但可繞過
-   **輕微錯誤（C級）**：< 50 個 - 介面或提示問題

### 相容性要求
-   **瀏覽器支援**：Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
-   **裝置支援**：桌面端（Windows/Mac/Linux）、手機端（iOS/Android）
-   **網路要求**：支援 4G/WiFi，斷線重連機制正常運作

## 雲端部署方案 (Updated)
-   **Frontend**: **VIVERSE Hosting** - 將前端整合進 VIVERSE 生態系。
-   **Backend**: **Zeabur** - 支援 Docker Compose，易於管理 GameServer 與 Database。
