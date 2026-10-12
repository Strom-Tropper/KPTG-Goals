# Goal

Client Pixi của Goal (`g-59`, trên dây là `c_huw_59`). Server giữ bom, tiền và đồng hồ. Client gửi lựa chọn rồi vẽ đúng gói trả về. Không tự tính thưởng, không tự kết lượt khi đồng hồ về 0.

Cách viết code nằm ở `AGENTS.md`. `RULE.md` là ghi chú slot cũ. Khi ghi chú khác code, code thắng.

## Bàn

7 cột, mỗi cột 4 ô, mỗi cột một bom. Hệ số cột 1–7: `1.29`, `1.72`, `2.29`, `3.06`, `4.08`, `5.45`, `7.26`.

Mức cược: `10000`, `20000`, `50000`, `100000`, `200000`, `500000`, `1000000`. PLAY gửi `level`, là khóa bậc, không phải số tiền tự tính. Mỗi bậc cược đúng số của nó.

Ba pha trên màn hình: `standby`, `playing`, `ended`. Mỗi lượt có hạn. Mốc là `deadline_ms` (Unix ms) trên khung đang chờ. Bản giao hàng: 30 giây một lượt, delay lộ bài 0 ms. Số trên `game_config` chỉ để hiện. Mốc trên khung mới là đồng hồ.

Chưa chốt: hết ván mà số dư không đủ mức đang chọn thì PLAY vẫn sáng. Bấm vào, server từ chối và báo thiếu tiền.

## Nút

Đang chờ server thì mọi nút khóa. Server từ chối thì bàn không đổi, chỉ hiện câu lỗi. Chưa chọn lại bet thì PLAY tắt. Chọn bet gồm cộng, trừ, hoặc một dòng trong danh sách.

| Nút | Vừa vào | Đã chọn bet | Sau Reset Bet | Đang chơi, chưa qua cột | Đã qua ít nhất một cột | Hết ván |
| --- | --- | --- | --- | --- | --- | --- |
| PLAY / CASHOUT | PLAY tắt | PLAY bật | PLAY tắt đến khi chọn lại bet | CASHOUT tắt | CASHOUT bật, hiện số tiền | PLAY bật |
| RANDOM | tắt | tắt | tắt | bật | bật | tắt |
| Reset Bet | tắt | tắt | tắt | tắt | tắt | bật |
| Bet, cộng, trừ | bật | bật | bật | tắt, chữ xám | tắt, chữ xám | tắt, chữ xám |
| History | bật | bật | bật | tắt | tắt | bật |
| Ô | không bấm | không bấm | không bấm | chỉ cột đang sáng | chỉ cột đang sáng | không bấm |

Mức 1 khóa nút trừ. Mức 7 khóa nút cộng. Reset Bet không gửi server: về `standby`, giữ mức bet, giữ bàn, giữ số giây. PLAY mới xóa dấu ván cũ.

## Một ván

1. Chọn mức. PLAY gửi `202`.
2. Ví xác nhận cược. Server chia bom giấu, trả `101` deal, cột 1 sáng, đồng hồ chạy.
3. Người chơi bấm một ô (`203`), RANDOM (`204`), hoặc từ lượt 2 thì CASHOUT (`205`).
4. Mỗi hành động được nhận trả một `101`. Không có opcode trả riêng, không có gói tổng kết.
5. An toàn: ô vừa đi là bóng, các ô an toàn trước đó là chấm, cột đó chưa vẽ bom, sáng cột kế. `current_win` là số CASHOUT đang rút được.
6. `done: true` thì vào `ended`. Bàn và số giây giữ nguyên. PLAY và Reset Bet bật.

Đang chơi chỉ vẽ ô đã chọn. Bom hiện khi cột đó được lộ. Khung kết thúc lộ hết bảy cột.

| Cách hết | `ending` | Tiền |
| --- | --- | --- |
| Đạp bom | `trap` | 0 |
| CASHOUT | `cashout` | cược × hệ số cột vừa qua |
| Hết giờ, đã rời máy, đã qua cột | `cashout_inactive` | như CASHOUT |
| Hết giờ, đã rời máy, chưa qua cột | `abandoned_at_start` | hoàn cược |
| Qua hết cột 7 | `max` | cược × hệ số cột 7 |

Hết hạn mà còn nối: server tự RANDOM (`by: "timeout"`, `presence: "connected"`). Đã rời máy: lượt 1 hoàn cược, lượt sau tự cashout. Client không tự chọn ô khi đồng hồ về 0.

Cột đã đi giữ dấu, nền thường. Cột chưa đi trên khung kết thúc nền đỏ, bom hiện. Ô vừa đạp bom là nổ.

## Socket

Trình duyệt nối **ws-service**, không nối thẳng process game.

```text
{ws-service-url}/ws?token={token}&gameId=c_huw_59
```

Bốn query ví `walletProvider`, `walletPlatformId`, `walletResource`, `walletScopeIds` đi đủ bốn hoặc không gửi. Thiếu một cái thì rơi về ví chính. Mỗi lần nối phải gửi lại. Nối không kèm ví thì vào ví chính.

Demo không cần token: nền tảng cấp khi `walletPlatformId` là nền tảng demo. Mỗi lần nối demo là một danh tính mới.

Gói game khóa opcode bằng `c`. Gói của ws-service khóa bằng `code`. Cùng số `199` là hai việc khác nhau: `c` là từ chối của game, `code` là ws-service sắp đóng socket.

Mẫu hành động:

```json
{ "c": 203, "data": { "ordinal": 2, "slot": 1 } }
```

`100` để field cạnh `c`. `402` để `page` và `limit` cạnh `c`. `196` dùng `code`.

### Client gửi

| `c` | Việc | `data` |
| --- | --- | --- |
| 202 | PLAY | `{ "level": 10000 }` khóa bậc. Ván đang giữ thì không mở ván mới |
| 203 | PICK | `ordinal`, `slot` từ `0` đến `3` |
| 204 | RANDOM | `ordinal`. Server rút ô |
| 205 | CASHOUT | `ordinal`. Lượt 1 bị từ chối |
| 206 | STATE | `{}`. Đọc lại snapshot, không giải lượt |
| 402 | lịch sử | `page` từ `0`, `limit` mặc định `10`, nằm cạnh `c` |
| 666 | cheat QA | chỉ khi server bật. Không phải nút người chơi |

Opcode nền tảng, core-lib trả: `100` xin lại gói đầu, `208` chọn ví rồi trả `100` mới, `210` giữ session này khi `SESSION_CONFLICT`, `211` nhường session kia.

**Ordinal.** Trả lời bằng ordinal của khung vừa nhận cộng 1. Khung chia bài là `1`, nên ô đầu gửi `2`. Snapshot lúc nối đã để sẵn số cần gửi trong `open.ordinal`. Gửi số khác thì `STALE_SCREEN`, bàn không đổi. Hai tab cùng một lượt: tab đến trước ăn, tab sau thành stale.

PLAY khi đang giữ một ván:

| Ván đang giữ | PLAY |
| --- | --- |
| Đang chờ lượt còn hạn | Không giải. Gửi lại trạng thái trên `206` |
| Đã quá hạn | Giải đúng như timer, trả `101` |
| Còn chờ ví | `ACTIVE_ROUND_EXISTS`. Không trừ tiền lần hai |

Không có trả lời trên `202`. Khung deal tới sau khi ví nhận cược. Ví từ chối thì `199` (`INSUFFICIENT_BALANCE` hoặc `BET_FAILED`).

Hành động được tính lúc server nhận. Tới trước hạn thì vẫn ăn dù xử lý sau hạn. Tới sau hạn thì không bị từ chối: timer giải lượt trước, khung đó là câu trả lời.

### Server trả

| Mã | Việc của client |
| --- | --- |
| 100 | Khôi phục theo `state`. Kèm `game_config` |
| 101 | Vẽ lượt. Đặt lại đồng hồ theo `deadline_ms` |
| 196 | Sửa số dư ví `scope_id`. ws-service gửi, khóa `code` |
| 199 | Hiện lỗi. Bàn giữ nguyên |
| 206 | Cùng snapshot với `state` của `100` |
| 452 | Một trang lịch sử |

`game_config` bản giao: `bet_levels` (mỗi phần có `level` và `bet`), `trap_count` `1`, `multipliers_x100` `[129,172,229,306,408,545,726]`, `turn_timer_seconds` `30`, `reveal_delay_ms` `0`. Bậc, số bom và hệ số là bản một ván mới sẽ ghim. Ván đang mở giữ bản của nó. Không có layout bom trên gói này.

`state.state`:

| Giá trị | Vẽ |
| --- | --- |
| `idle` | Không có ván. Mời PLAY |
| `waiting` | Ván đang mở. Đếm tới `open.deadline_ms`. Trả lời bằng `open.ordinal` |
| `expired` | Cùng ván, đã quá hạn, chưa có kết quả. Không đếm, không hiện kết. Khung giải sắp tới |
| `unseen` | Ván server kết thúc lúc không ai nối, đưa **một lần**. Chỉ có `cashout_inactive` và `abandoned_at_start` |

`open`: `ticket_id` (khóa tiền), `round_id` (số hiện, 10 chữ số), `ordinal`, `next` (`first_cross` hoặc `cross`), `bet`, `cleared`, `current_win`, `board`, `turns`, `deadline_ms`, `expired`.

### Khung 101

```json
{
  "c": 101,
  "data": {
    "ticket_id": "…",
    "round_id": "0000000042",
    "ordinal": 3,
    "kind": "cross",
    "win": 0,
    "total": 0,
    "payload": {
      "next": "cross",
      "cleared": 2,
      "turn": { "ordinal": 3, "column": 2, "by": "player", "action": "pick", "slot": 1 },
      "board": [1, 1, null, null, null, null, null],
      "current_win": 17200
    },
    "deadline_ms": 1791374520000
  }
}
```

`kind`: `deal`, `first_cross` (cột 1), `cross` (cột 2–7). `ordinal` `1` là chia bài, `n + 1` là lần qua cột `n`. `win` là tiền khung này trả. `total` là tiền ván đã trả. `done: true` chỉ có trên khung cuối. `deadline_ms` là hạn của lượt kế. Hết ván thì không có field này, không có `next`.

`turn` vắng trên deal. `column` là 1–7. `by` là `player` hoặc `timeout`. `action` là `pick`, `random`, `cashout`, hoặc `abandon`. `slot` vắng khi cashout hoặc abandon. `trap: true` khi ô đó là bom. `presence` chỉ có khi `timeout`: `connected` hoặc `away`.

`round_id` của người chơi thật lấy từ một bộ đếm chung, tăng nhưng có lỗ. Demo đếm vòng của chính họ từ `0000000001`, đặt lại khi lịch sử demo 1 giờ hết hạn. Hai loại id có thể trùng. Khóa ván là `ticket_id`.

`board[n]` là mask bom của cột `n + 1`. Bit `i` bật thì ô `i` là bom: `1` ô 0, `2` ô 1, `4` ô 2, `8` ô 3. `null` là chưa lộ. Cột lộ ở khung vừa đi qua nó và mọi khung sau. Khung cuối lộ cả bàn. Ô là bom khi `(mask & (1 << slot)) !== 0`. `turn.column` đếm từ 1, `board` đếm từ 0.

Id số dài (19 chữ số, như `member_id`) bị `JSON.parse` làm tròn. Giữ dạng chuỗi nếu phải so hoặc gửi lại.

### Hết giờ

Hạn lượt 1 = lúc ví xác nhận + timer. Lượt sau = lúc giải lượt trước + reveal delay + timer. Sau một lần trễ, hạn kế tính từ **hạn đã trễ**, không tính từ lúc server kịp xử lý.

| Lúc hết hạn | Lượt 1 | Lượt 2–7 |
| --- | --- | --- |
| Còn nối | RANDOM | RANDOM |
| Đã rời | hoàn cược, `abandon` | cashout số đang có |

Mỗi tab một session. Game chỉ biết người chơi rời khi session cuối cùng đóng. Presence đọc lúc hết hạn, không đọc từ sự kiện ngắt.

### Lỗi 199

Hiện `error`. Nhánh theo `errc`. `err` là số thông báo của nền tảng, nhiều nguyên nhân chung một số.

| `errc` | Khi nào |
| --- | --- |
| `INVALID_BET_LEVEL` | `level` không có trên bậc |
| `ACTIVE_ROUND_EXISTS` | PLAY trong lúc ván còn chờ ví |
| `INSUFFICIENT_BALANCE` | Ví từ chối cược, chưa chia bài |
| `NO_ACTIVE_ROUND` | PICK, RANDOM, CASHOUT khi không giữ ván |
| `STALE_SCREEN` | Sai ordinal |
| `ACTION_NOT_ALLOWED` | CASHOUT lượt 1, ô ngoài bàn, hoặc payload không đọc được |
| `CHEAT_DISABLED` | `666` khi bản deploy không cho tài khoản này |
| `INVALID_CHEAT` | `666` không thành một ván hợp lệ. Câu chữ nêu field lỗi |
| `BET_FAILED` | Phần còn lại |

Từ chối không ghi gì. Ordinal và hạn giữ nguyên.

### Lịch sử 452

`{ "c": 452, "list": [], "total": 0, "page": 0, "limit": 10 }`. Mỗi dòng có field nền tảng (`ticket_id`, `round_id`, `bet`, `win`, `status`, …) và `cleared`, `board`, `turns`, `ending`. Ván đã kết lộ hết cột. Ván đang chạy chỉ lộ cột đã đi. Phân trang bằng `page` và `total`.

`196`: `{ "code": 196, "balance": 980, "scope_id": "c_huw_59", "platform_id": "…" }`. ws-service còn gửi `code` `102` (số dư chính), `199` (sắp đóng), `411` (đá session cũ vì quá giới hạn, đi cùng `199`).

Cheat `666` chỉ dành QA, cần `CHEAT_ENABLED`. Production hoặc `APP_ENV` trống thì chỉ tài khoản `demo_*`. Ô cheat đếm `1`–`4`, khác ô PICK đếm `0`–`3`. Nó ghim ván PLAY kế, không đụng ván đang mở, hết hạn sau 10 phút. Luật trả thưởng vẫn là luật thật.

## Chạy

Từ `storm`: `cp env.example ../.env` rồi `docker compose up`. Container `pj-59-goal`, Node 20, repo mount vào `/app`. Mở `http://localhost:8090`. `npm run dev` trên máy host cũng dùng cổng đó. Dừng bằng Ctrl-C hoặc `docker compose down`.

`.env` nằm ở root. Không có file này thì màn hình vẫn lên: `VITE_GAME_ID` fallback `app`, ngôn ngữ fallback `en`. `VITE_WS_URL` trống thì bàn hiện và báo mất kết nối. Muốn chơi một vòng thì điền URL rồi `docker compose up` lại.

`vite build` cần `VITE_PRODUCTION_ASSET_BASE_URL`, `VITE_ASSETS_PATH`, `VITE_JS_PATH`. Compose không chạy build production và không chạy assetpack.

Cài và script npm nằm ở `README.md` root.
