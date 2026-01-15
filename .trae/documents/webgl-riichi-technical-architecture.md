# WebGL Riichi Mahjong - 技術架構文件

## 1. 系統架構圖 (High-Level Architecture)

```mermaid
graph TD
    Client[WebGL Client (React/R3F)]
    
    subgraph "Viverse Cloud Services"
        Auth[Viverse Auth]
        Storage[User Storage]
        Avatar[Avatar Service]
    end

    subgraph "Game Cluster"
        LB[Load Balancer]
        Gateway[Game Gateway (Node.js/Go)]
        GameServer[Legacy Game Server (Vala/C++)]
        VoiceServer[Voice Server (WebRTC/LiveKit)]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL/Supabase)]
        Redis[(Redis - Session/Matchmaking)]
    end

    Client -->|HTTPS| Auth
    Client -->|HTTPS| Gateway
    Client -->|WebSocket| Gateway
    Client -->|WebRTC| VoiceServer
    
    Gateway -->|TCP/IPC| GameServer
    Gateway -->|SQL| DB
    Gateway -->|Redis| Redis
    
    Gateway -.->|API| Auth
    Gateway -.->|API| Storage
```

## 2. 前端架構 (Frontend)

### 2.1 技術棧
-   **核心框架**：React 18
-   **3D 引擎**：React Three Fiber (Three.js wrapper)
-   **狀態管理**：Zustand (輕量級，適合高頻更新)
-   **UI 組件庫**：Chakra UI 或 Tailwind CSS (用於 2D 介面)
-   **通訊協議**：
    -   Socket.io-client / Native WebSocket (遊戲即時通訊)
    -   Axios / Fetch (REST API)
    -   Simple-Peer / LiveKit Client (語音通訊)
-   **構建工具**：Vite

### 2.2 模組設計
-   **GameScene**：負責 3D 場景渲染（牌桌、手牌、牌河）。
-   **GameLogic**：前端狀態機，預測與同步伺服器狀態。
-   **NetworkManager**：處理 WebSocket 封包收發與斷線重連。
-   **AudioManager**：管理背景音樂、音效與語音串流。
-   **LobbyUI**：大廳介面、房間列表、聊天視窗。

## 3. 後端架構 (Backend)

### 3.1 Game Gateway (BFF Layer)
由於需保留現有後端邏輯且支援 Web 協議，我們引入一個 Gateway 層。
-   **職責**：
    -   **WebSocket 終端**：處理來自 WebGL 客戶端的連線。
    -   **協議轉換**：將 WebSocket JSON 訊息轉換為後端 Vala Server 的 TCP/Binary 格式。
    -   **Viverse 整合**：處理登入驗證、API 轉發。
    -   **LLM Hook**：攔截遊戲狀態，轉發給註冊的 LLM Agent。
-   **技術**：Node.js (TypeScript) 或 Go。

### 3.2 Legacy Game Server (現有後端)
-   **狀態**：保持核心邏輯不變 (Black Box)。
-   **運行方式**：作為 Docker 容器運行，僅對 Gateway 暴露端口。
-   **擴展策略**：每個 Game Server 實例處理 N 個桌子，透過 K8s Pod 進行水平擴展。

### 3.3 數據存儲 (Data Persistence)
-   **PostgreSQL (Supabase)**：
    -   `users`: Viverse ID, 暱稱, 籌碼餘額, 頭像 URL。
    -   `game_logs`: 牌譜數據 (JSONB)。
    -   `leaderboards`: 統計數據 (胡牌數, 局數)。
-   **Redis**：
    -   即時在線玩家列表。
    -   Lobby 聊天紀錄快取。
    -   Matchmaking 隊列。

## 4. LLM Agent 整合層
-   **Agent Registry**：Agent 透過 REST API 註冊 (Name, Endpoint, Capabilities)。
-   **Observation Hook**：Gateway 在每一幀或事件觸發時，將 `GameState` 推送給訂閱的 Agent。
-   **Action API**：Agent 回傳決策 (Discard, Chi, Pon, Riichi) 給 Gateway。

## 5. 部署架構 (Deployment)
### 5.1 推薦方案：VIVERSE + Zeabur
配合 VIVERSE 生態系整合策略，將前端託管於 VIVERSE 平台，後端服務則運行於 Zeabur。

-   **Frontend**: **VIVERSE Hosting**
    -   優勢：深度整合 VIVERSE 入口、直接獲取 Viverse Auth Token (無須重導向)、符合平台生態規範。
    -   配置：
        -   將 React/Vite 專案 Build 為靜態檔案 (SPA)。
        -   透過 VIVERSE 開發者後台或 CLI 上傳部署。
        -   **CORS 設定**：需在 Zeabur 後端允許來自 VIVERSE 域名的跨域請求。
-   **Backend**: **Zeabur**
    -   優勢：原生支援 Docker Compose、提供持久化存儲 (Volume)、自動分配域名、台灣節點低延遲。
    -   配置：
        -   Service A: **Game Gateway** (Node.js/Go) - 處理 WebSocket 連線。
        -   Service B: **Game Server Cluster** (Legacy Vala) - 運行在 Docker 容器中。
        -   Service C: **PostgreSQL** - 資料庫。
        -   Service D: **Redis** - 快取與排隊。

### 5.2 擴展性設計
-   **Gateway**：無狀態 (Stateless)，可隨意水平擴展。
-   **GameServer**：有狀態，透過 Zeabur 的 Stateful Set 或 Docker 固定端口映射。
-   **目標支持**：初期單節點 (Zeabur Team Plan) 即可支持 25+ 桌並發。
