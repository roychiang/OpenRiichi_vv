# WebGL Riichi Mahjong - LLM Agent 探索與整合層

## 1. 概述
本模組旨在建立一個開放的生態系統，讓開發者可以將自定義的 LLM (Large Language Model) 麻將 AI 接入遊戲中，並讓一般玩家能夠在遊戲中發現並挑戰這些 Agent。

## 2. Agent Discovery Layer (探索層)
位於遊戲大廳的一個專屬區域，玩家可以在此瀏覽可用的 AI Agent。

### 2.1 Agent 展示卡片
每個 Agent 包含以下資訊：
-   **名稱 (Name)**: e.g., "RiichiMaster-GPT4"
-   **開發者 (Developer)**: e.g., "OpenAI Community"
-   **風格描述 (Style)**: e.g., "防守型，重視鳴牌"
-   **Rating (Elo)**: 基於對戰紀錄的實力評分。
-   **Avatar**: Agent 的虛擬形象。

### 2.2 互動方式
-   **挑戰模式**：玩家可邀請 Agent 入桌對戰。
-   **輔助模式**：玩家可開啟 Agent 建議，由 Agent 提示最佳切牌 (Copilot)。

## 3. Agent API 規範

### 3.1 通訊協議
-   **模式**：WebSocket 或 HTTP Long-Polling。
-   **格式**：JSON。

### 3.2 觀察 (Observation)
當輪到 Agent 行動，或場上有事件發生時，Server 推送 `GameState`：

```json
{
  "type": "observation",
  "gameId": "room-123",
  "seat": 0,
  "hand": ["1m", "2m", "3m", ...],
  "discards": ["1s", "9p"],
  "dora": ["5z"],
  "scores": [25000, 25000, 25000, 25000],
  "round": "E1-0",
  "can_riichi": true,
  "can_ron": false
}
```

### 3.3 決策 (Action)
Agent 需在時限內（如 5 秒）回傳決策：

```json
{
  "type": "action",
  "gameId": "room-123",
  "action": "discard",
  "tile": "1m",
  "reasoning": "手牌向聽數為 2，打出 1m 效率最高..." // 可選，用於解釋 AI 思路
}
```

### 3.4 註冊與鑑權
-   開發者需在開發者後台註冊 Agent，獲取 `API_KEY`。
-   Gateway 驗證 `API_KEY` 後允許 Agent 接入遊戲流。

## 4. 安全與限制
-   **Rate Limit**: 限制 Agent 的請求頻率。
-   **Timeout**: 若 Agent 超時未回應，系統將自動以「模切」處理，並標記該 Agent 不穩定。
-   **Anti-Cheat**: 傳送給 Agent 的資訊嚴格過濾，不包含其他家手牌與牌山資訊。

## 5. 未來擴展
-   **Agent 聯賽**：舉辦純 AI 的對戰比賽。
-   **性格訓練**：允許玩家透過對話微調 Agent 的打牌風格。
