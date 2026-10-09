# C-HUW-59 WebSocket packet reference

This is the wire-level contract for the packets HUW receives and sends through core-lib. The browser connects to **ws-service**, not directly to this process. For the shorter client read, see [frontend-integration.md](frontend-integration.md); for the reasoning behind each decision, `docs/analysis/05-sframe-design.md` in the repository.

A running non-production instance serves this document at **`/docs/ws`**, on the same port as the game.

The `101` examples are the golden frames in `internal/wire/testdata/frames/` or frames the served game pushed in its test harness; the `state`, `206` and `199` bodies were captured from the same harness. Ids, deadlines and layouts differ per round. The `100` wallet fields and the `196` frame belong to core-lib and ws-service and are shown in their documented shape.

## Connection and routing

Connect to the ws-service endpoint with the authenticated game token and the game id:

```text
{ws-service-url}/ws?token={token}&gameId=c_huw_59
```

Include the wallet-routing query parameters only when the chosen wallet needs scoped routing: `walletProvider`, `walletPlatformId`, `walletResource`, and `walletScopeIds`. They are **all four or none** — a half-set falls back to the main wallet. **A reconnect must name the wallet again**; a connect naming none lands on the main wallet.

A demo session needs no token: the platform mints one when `walletPlatformId` is the demo platform. A demo identity is minted per connect, so nothing carries across two demo connects.

## Packet flow

One round is: PLAY at a level, the server deals a hidden trap layout for seven columns of four slots, and the player crosses one column per turn. Each turn is **PICK** a slot, **RANDOM** (the server picks), or — from turn 2 — **CASHOUT** at the last cleared column's multiplier. A trap ends the round with nothing; clearing column 7 cashes out automatically at its multiplier.

Every turn has a deadline. If the player has not answered when it passes, **the server resolves the turn itself**, whether or not anyone is connected ([the turn timer](#the-turn-timer)).

```mermaid
sequenceDiagram
    participant Client
    participant WS as ws-service / core-lib
    participant HUW as HUW backend

    WS->>Client: 100 initial state (state)
    Client->>WS: 202 PLAY { level }
    Note over HUW: the wallet confirms the stake
    HUW->>WS: 101 deal (ordinal 1, deadline_ms for turn 1)
    loop each turn, columns 1..7
        alt the player answers in time
            Client->>WS: 203 PICK / 204 RANDOM / 205 CASHOUT { ordinal, … }
        else the deadline passes
            Note over HUW: connected → RANDOM; away → cashout (turn 1: refund)
        end
        HUW->>WS: 101 crossing (next turn's deadline_ms, or done)
    end
    HUW->>WS: 199 error (on a refused action)
```

There is no reply opcode for an action and no round summary: every accepted action is answered by the `101` frame it resolved, and the round ends on the frame carrying `done: true`.

## Client-to-server packets

Every action has this envelope:

```json
{ "c": 203, "data": { "ordinal": 2, "slot": 1 } }
```

| Opcode | Name | `data` | Effect |
| --- | --- | --- | --- |
| `202` | PLAY | `{ "level": 10000 }` | Takes the stake and opens a round; on a held round, resumes it instead. |
| `203` | PICK | `{ "ordinal": 2, "slot": 1 }` | Crosses the waiting column on that slot. |
| `204` | RANDOM | `{ "ordinal": 2 }` | Crosses the waiting column on a slot the server draws. |
| `205` | CASHOUT | `{ "ordinal": 3 }` | Ends the round at the current win. Not on turn 1. |
| `206` | STATE | `{}` | Answers on `206` with what a connect would show. Resolves nothing. |
| `666` | CHEAT | `{ "traps": [[1], [2]], "spares": [null, 4] }` | QA only: forces the player's **next** round. Refused unless the deployment allows it. |

### The ordinal contract

**Answer with the last frame's `ordinal` + 1.** The deal frame is ordinal `1`, so turn 1 is answered with `2`; a crossing frame's ordinal is the turn it resolved, so the next turn is that + 1. The connect snapshot's `open.ordinal` is already the ordinal to answer with — do not add one to it.

An answer naming any other ordinal is refused `STALE_SCREEN` and changes nothing. That is also how two tabs answering one turn resolve: the first applies, the second is stale.

### PLAY — `202`

```json
{ "c": 202, "data": { "level": 10000 } }
```

`level` is a key of the published ladder — an integer or its string form — never an amount. The shipped ladder is `10000`, `20000`, `50000`, `100000`, `200000`, `500000` and `1000000`, each staking its own value. A level not on the ladder is refused `INVALID_BET_LEVEL`; a `level` that is neither an integer nor a string is refused `ACTION_NOT_ALLOWED`.

There is no reply on `202`. The round's first frame, `deal`, arrives once the wallet confirms the stake; a declined stake arrives as a `199` instead (`INSUFFICIENT_BALANCE`, or `BET_FAILED`).

A player holds one round at a time. PLAY while one is held never opens another:

| The held round | PLAY does |
| --- | --- |
| waiting on a live turn | Resolves nothing and re-sends the round's state on `206`. |
| past its deadline | Resolves the lapse now, exactly as the timer would, and its `101` is the answer. |
| still waiting on the wallet | Refused `ACTIVE_ROUND_EXISTS`; nothing is charged twice. |

### PICK — `203`, RANDOM — `204`, CASHOUT — `205`

```json
{ "c": 203, "data": { "ordinal": 2, "slot": 1 } }
{ "c": 204, "data": { "ordinal": 2 } }
{ "c": 205, "data": { "ordinal": 3 } }
```

| Field | Type | Requirement |
| --- | --- | --- |
| `ordinal` | number | The last frame's ordinal + 1 ([the ordinal contract](#the-ordinal-contract)). |
| `slot` | number | PICK only: `0`–`3`. Anything else is refused `ACTION_NOT_ALLOWED` before it reaches the round. |

RANDOM's slot is drawn by the server on every crossing, whoever answers, so pressing RANDOM and letting the timer pick for a connected player land on the same slot. CASHOUT on turn 1 is refused `ACTION_NOT_ALLOWED`: nothing is secured before column 1 clears.

**An answer is judged at the instant the server receives it.** One received before the deadline is honoured even if it is processed after; one received after the deadline is not refused — the lapse resolves the turn first, and its frame is the answer.

### Cheat — `666` (QA only)

```json
{ "c": 666, "data": { "traps": [[1], [2], [3], [4], [1], [2], [3]], "spares": [null, 4] } }
```

A test tool's opcode, never a player's. **It is refused unless the server runs with `CHEAT_ENABLED=true`. When `APP_ENV` is `production` or unset, only demo accounts (`demo_*`) may send it**; a real-money player is refused whatever the flag says.

| Field | Type | Requirement |
| --- | --- | --- |
| `traps` | `number[][]`, up to 7 | Column `n`'s trap slots, **`1`–`4`**, exactly `board.trap_count` of them, distinct. `null` or `[]` leaves a column drawn. Optional. |
| `spares` | `(number \| null)[]`, up to 7 | The slot RANDOM — or a connected player's lapse — crosses in column `n`, `1`–`4`. `null` leaves it drawn. Optional. |
| `clear` | boolean | `true` disarms. It cannot be sent with a column. |

**Cheat slots are numbered `1`–`4`**, as the back office's `game_your_bet` text prints them — not `0`–`3` as PICK and the frames carry them. Slot `2` here is `1` everywhere else.

The fields may also sit flat beside `c`, and core-lib's `o` is refused if set: HUW forces a layout, not an outcome. An unknown field is refused rather than ignored.

- **It arms the player's next PLAY only.** A round already open is never touched; PLAY takes the armed cheat atomically, so it rigs exactly one round. A PLAY refused with `ACTIVE_ROUND_EXISTS` leaves it armed.
- **An armed cheat expires after 10 minutes** if no PLAY takes it. Arming again replaces it; `{ "c": 666 }`, `{ "c": 666, "data": {} }` or `clear` disarms it.
- **Everything is still scored by the real rules and paid by the real paytable**: a cheat substitutes the deal, never a result. A forced column of the wrong trap count — a publish landing between arm and PLAY — is drawn instead.
- **The forced layout is as secret as a drawn one**: frames and snapshots reveal a column only once played, and the whole board at the terminal.
- **A cheated round is marked**: its settled `bet_option` carries `"cheated": true`, and it is left out of the `huw_*` metrics.

The reply is a `666` on the requesting session naming what is now armed, in the same `1`–`4` numbering, `null` for a column left to chance:

```json
{ "armed": true, "traps": [[1], [2], [3], [4], [1], [2], [3]], "spares": [null, 4, null, null, null, null, null] }
```

`{ "armed": false }` acknowledges a disarm. A refusal is a `199`: `CHEAT_DISABLED` where the deployment does not allow it, `INVALID_CHEAT` naming the field at fault (`traps: column 1 names 2 traps, the board has 1`). Both arm nothing; `INVALID_CHEAT` is the one refusal whose text names its cause, the tester's own payload.

### Platform opcodes

Answered by core-lib on this socket, not by HUW:

| Opcode | Payload | Effect |
| --- | --- | --- |
| `100` | flat fields beside `c`, e.g. `{ "c": 100, "force_refresh": "true" }` | Re-sends the initial packet. |
| `208` | `{ "c": 208, "data": { "wallet_type": "points:demo_1" } }` | Selects the wallet every following round is charged to, then answers with a fresh `100`. |
| `210` / `211` | `{ "c": 210 }` | Answers a `SESSION_CONFLICT`: `210` continues here, `211` leaves the other session. |
| `402` | `{ "c": 402, "page": 0, "limit": 10 }` | Round history, answered by `452`. |

## Server-to-client packets

| Opcode | Packet | Client action |
| --- | --- | --- |
| `100` | Initial state | Restore whatever `state` reports. |
| `101` | Status frame | Render the crossing and restart the countdown from `deadline_ms`. |
| `196` | Wallet balance | Update the balance of the wallet named by `scope_id`. Sent by ws-service, not by the game. |
| `199` | Error | Show the refusal; a refused action leaves the round exactly as it was. |
| `206` | State | The same snapshot as `100`'s `state`, on STATE or on PLAY over a live round. |
| `452` | Round history | Display a page of the player's settled rounds. |

The connect packet puts its fields beside `c`; every packet HUW pushes (`101`, `199`, `206`) puts its body inside `data`.

### Initial state — `100`

The first message after a successful connection is a flat `c: 100` object. The platform fills the wallet and identity fields; **HUW contributes two keys, `game_config` and `state`**.

```text
{ "c": 100, <core-lib's wallet and identity fields>, "game_config": { … }, "state": { "state": "idle" } }
```

### Game configuration — `game_config`

What a client offers and labels: the ladder, the trap count, the seven multipliers and the timing. The shipped values:

```json
{"bet_levels":[{"level":"10000","bet":10000},{"level":"20000","bet":20000},{"level":"50000","bet":50000},{"level":"100000","bet":100000},{"level":"200000","bet":200000},{"level":"500000","bet":500000},{"level":"1000000","bet":1000000}],"trap_count":1,"multipliers_x100":[129,172,229,306,408,545,726],"turn_timer_seconds":30,"reveal_delay_ms":0}
```

| Field | Meaning |
| --- | --- |
| `bet_levels` | The ladder, by stake ascending. Send `level` in PLAY; `bet` is what it stakes. |
| `trap_count` | Traps per column. |
| `multipliers_x100` | Columns 1–7's multipliers × 100: a cashout after column `n` pays `bet × multipliers_x100[n-1] / 100`. Display only — the frame's `current_win` is what is paid. |
| `turn_timer_seconds`, `reveal_delay_ms` | The turn timer and the reveal delay ([the turn timer](#the-turn-timer)). Every frame's `deadline_ms` is still the authority. |

The ladder, trap count and multipliers are the version a **new** round would pin; a round already open keeps its own. The timer and reveal delay are the ones the server started with, since a published change waits for a restart. Nothing here is secret: no trap layout, seed or key is ever on it.

### Connect state

`state.state` is one of four strings. Reading the snapshot resolves nothing.

| `state` | Carries | What to render |
| --- | --- | --- |
| `idle` | nothing | No round. Offer PLAY. |
| `waiting` | `open` | The open round, counting down to `open.deadline_ms`. Answer with `open.ordinal`. |
| `expired` | `open` | The same round past its deadline with no result yet. Show no countdown and no outcome; the lapse frame is on its way. |
| `unseen` | `finished` | A round the server finished while nobody was connected, shown **once**: reading it marks it seen. |

`waiting`, captured:

```json
{"state":"waiting","open":{"ticket_id":"01a11a6b-3ca5-710d-9778-4afff511bf34","round_id":"0000000041","ordinal":3,"next":"cross","bet":10000,"cleared":1,"board":[1,null,null,null,null,null,null],"turns":[{"ordinal":2,"column":1,"by":"player","action":"pick","slot":1}],"current_win":12900,"deadline_ms":1791374432000,"expired":false}}
```

`expired` is the same body with `"state":"expired"` and `"expired":true`. `unseen`, captured after an away player was cashed out on turn 2:

```json
{"state":"unseen","finished":{"ticket_id":"01a11a6b-3ca6-70a0-9b9a-81869d3cc977","round_id":"0000000042","bet":10000,"win":12900,"ending":"cashout_inactive","board":[8,1,1,2,4,2,8],"turns":[{"ordinal":2,"column":1,"by":"player","action":"pick","slot":0},{"ordinal":3,"column":2,"by":"timeout","action":"cashout","presence":"away"}]}}
```

| `open` field | Meaning |
| --- | --- |
| `ticket_id`, `round_id` | The round. `ticket_id` is the money key; `round_id` is its display number ([below](#status-frame--101)). |
| `ordinal` | The ordinal to answer the waiting turn with. |
| `next` | `first_cross` (turn 1, no cashout) or `cross`. |
| `bet`, `cleared`, `current_win` | The stake, the columns cleared, and what a cashout pays now. |
| `board`, `turns` | As in the [status frame](#status-frame--101). |
| `deadline_ms` | When the waiting turn lapses, Unix milliseconds. |
| `expired` | `true` exactly when `state` is `expired`. |

Only two endings are ever held unseen, `cashout_inactive` and `abandoned_at_start` — the two the server reaches for an away player. A round a connected player saw end is never shown again.

### Status frame — `101`

```json
{
  "c": 101,
  "data": {
    "ticket_id": "golden",
    "round_id": "0000000042",
    "ordinal": 3,
    "kind": "cross",
    "win": 0,
    "total": 0,
    "payload": {
      "next": "cross",
      "cleared": 2,
      "turn": { "ordinal": 3, "column": 2, "by": "timeout", "action": "random", "slot": 1, "presence": "connected" },
      "board": [1, 1, null, null, null, null, null],
      "current_win": 17200
    },
    "deadline_ms": 1791374520000
  }
}
```

| `data` field | Type | Meaning |
| --- | --- | --- |
| `ticket_id` | string | The round, and its money key. |
| `round_id` | string | The round's display number, ten digits. A real or bot player's comes from one counter shared by all of them, which rises but has gaps (a PLAY refused for a held round burns its number). A demo player's counts their own rounds from `0000000001`, one past their last archived round, and restarts at `0000000001` once their 1 h demo history expires. Demo and real ids overlap, so `ticket_id`, not `round_id`, keys the round. |
| `ordinal` | number | The screen this frame resolved: `1` is the deal, `n + 1` is column `n`'s crossing. |
| `kind` | string | `deal`, `first_cross` (column 1) or `cross` (columns 2–7). |
| `win` | number | What this screen paid. |
| `total` | number | What the round has paid. |
| `done` | boolean | Present, and `true`, on the round's last frame only. |
| `payload` | object | The board, below. |
| `deadline_ms` | number | When the **next** turn lapses, Unix milliseconds. Absent once done. |

| `payload` field | Meaning |
| --- | --- |
| `next` | The turn now waiting: `first_cross` or `cross`. Absent once done. |
| `cleared` | Columns cleared so far. |
| `turn` | The crossing this frame resolved. Absent on the deal. |
| `board` | Seven entries, one per column ([board masks](#board-masks)). |
| `current_win` | What a cashout would pay now; the round's win once done. |
| `ending` | How the round ended. Present once done. |

| `turn` field | Meaning |
| --- | --- |
| `ordinal`, `column` | The turn, and the column (1–7) it crossed. |
| `by` | `player`, or `timeout` when the deadline resolved it. |
| `action` | `pick`, `random`, `cashout`, or `abandon` (an away turn 1). |
| `slot` | The slot crossed. Absent on `cashout` and `abandon`. |
| `trap` | `true` when the slot was a trap. |
| `presence` | On a `timeout` turn only: `connected` or `away`, as read at the lapse. |

The deal frame, pushed when the stake is confirmed:

```json
{"ticket_id":"01a11a6b-3ca5-710d-9778-4afff511bf34","round_id":"0000000041","ordinal":1,"kind":"deal","win":0,"total":0,"payload":{"next":"first_cross","cleared":0,"board":[null,null,null,null,null,null,null],"current_win":0},"deadline_ms":1791374430000}
```

The terminal frame of each ending, from the golden frames (whose layout has a trap on slot 0 of every column; `ticket_id` and `round_id` dropped):

| `ending` | Win | Terminal frame |
| --- | --- | --- |
| `trap` | 0 | `{"ordinal":3,"kind":"cross","win":0,"total":0,"done":true,"payload":{"cleared":1,"turn":{"ordinal":3,"column":2,"by":"player","action":"pick","slot":0,"trap":true},"board":[1,1,1,1,1,1,1],"current_win":0,"ending":"trap"}}` |
| `cashout` | stake × the last cleared column's multiplier | `{"ordinal":4,"kind":"cross","win":17200,"total":17200,"done":true,"payload":{"cleared":2,"turn":{"ordinal":4,"column":3,"by":"player","action":"cashout"},"board":[1,1,1,1,1,1,1],"current_win":17200,"ending":"cashout"}}` |
| `cashout_inactive` | the same, cashed out by the timer for an away player | `{"ordinal":4,"kind":"cross","win":17200,"total":17200,"done":true,"payload":{"cleared":2,"turn":{"ordinal":4,"column":3,"by":"timeout","action":"cashout","presence":"away"},"board":[1,1,1,1,1,1,1],"current_win":17200,"ending":"cashout_inactive"}}` |
| `abandoned_at_start` | the stake, refunded (1×) | `{"ordinal":2,"kind":"first_cross","win":10000,"total":10000,"done":true,"payload":{"cleared":0,"turn":{"ordinal":2,"column":1,"by":"timeout","action":"abandon","presence":"away"},"board":[1,1,1,1,1,1,1],"current_win":10000,"ending":"abandoned_at_start"}}` |
| `max` | stake × column 7's multiplier | `{"ordinal":8,"kind":"cross","win":72600,"total":72600,"done":true,"payload":{"cleared":7,"turn":{"ordinal":8,"column":7,"by":"player","action":"pick","slot":3},"board":[1,1,1,1,1,1,1],"current_win":72600,"ending":"max"}}` |

A trap frame from a real deal:

```json
{"ticket_id":"01a11a6b-80d5-7a8a-a96e-7461a2c17528","round_id":"0000000043","ordinal":3,"kind":"cross","win":0,"total":0,"done":true,"payload":{"cleared":1,"turn":{"ordinal":3,"column":2,"by":"player","action":"pick","slot":2,"trap":true},"board":[1,4,8,1,8,4,2],"current_win":0,"ending":"trap"}}
```

#### Board masks

`board[n]` is column `n + 1`'s trap mask: **bit `i` set means slot `i` is a trap** (`1` = slot 0, `2` = slot 1, `4` = slot 2, `8` = slot 3). **`null` means unrevealed.** A column is revealed in the frame that crosses it and in every frame after; the terminal frame reveals every column, so the player sees the whole layout. No frame, snapshot or record reveals an unplayed column of a live round.

Reading a board in JavaScript:

```js
const SLOTS = 4;

// trapSlots turns one column's mask into its trapped slot numbers (0–3), or null while unrevealed.
function trapSlots(mask) {
  if (mask === null || mask === undefined) return null;
  const slots = [];
  for (let slot = 0; slot < SLOTS; slot++) {
    if (mask & (1 << slot)) slots.push(slot);
  }
  return slots;
}

// isTrap answers one cell: true / false once the column is revealed, null before.
function isTrap(board, column, slot) {
  const mask = board[column];
  return mask === null || mask === undefined ? null : (mask & (1 << slot)) !== 0;
}

// The second round of a history row: { board: [4,2,2,1,1,4,8], turns: [...] }
const board = [4, 2, 2, 1, 1, 4, 8];
board.map(trapSlots);       // [[2], [1], [1], [0], [0], [2], [3]]
isTrap(board, 2, 1);        // true  — column 3, slot 1: the pick that ended the round
isTrap([1, null], 1, 0);    // null  — column 2 not revealed yet
```

`turn.slot` / `turns[].slot` and `trapSlots` use the same numbering (0–3), so a turn is a trap exactly when
`isTrap(board, turn.column - 1, turn.slot)` — `column` is 1-based, `board` is 0-based.

The shipped table has one trap per column, so each mask has exactly one bit set. Its multipliers, columns 1–7, are 1.29, 1.72, 2.29, 3.06, 4.08, 5.45 and 7.26: a stake of 10000 cashing out after column 2 wins 17200.

### The turn timer

| Rule | Value |
| --- | --- |
| Turn 1's deadline | The stake's confirmation + the turn timer (30 s shipped). The deal frame carries it. |
| A later turn's deadline | The previous turn's resolution + the reveal delay (0 ms shipped) + the turn timer. |
| After a lapse | The next deadline runs from the **lapsed deadline**, not from when the server got to it, so the deadlines chain and a late pass never stretches the round. |

When a deadline passes, the server reads whether the player holds a live session at that moment:

| At the lapse | Turn 1 | Turns 2–7 |
| --- | --- | --- |
| **connected** | RANDOM: the server crosses on its drawn slot, `by: "timeout"`, `presence: "connected"`. | The same. |
| **away** | `abandoned_at_start`: the stake is refunded and nothing is picked. | `cashout_inactive`: cashed out at the current win. |

A timer-made frame goes to the player's latest session. The turn timer and reveal delay are read when the server starts; a published change applies after a restart.

### Error — `199`

```json
{ "c": 199, "data": { "c": 199, "err": 4, "errc": "STALE_SCREEN", "error": "That screen has already resolved" } }
```

| `data` field | Type | Meaning |
| --- | --- | --- |
| `err` | number | The platform's notification number. Several causes share one; branch on `errc`. |
| `errc` | string | The stable machine-readable cause. |
| `error` | string | The text to show the player, fixed per `errc`; it never carries the cause. |

| `err` | `errc` | When |
| ---: | --- | --- |
| `1` | `INVALID_BET_LEVEL` | PLAY's `level` is not on the ladder. |
| `2` | `ACTIVE_ROUND_EXISTS` | PLAY while the held round still waits on the wallet. |
| `3` | `INSUFFICIENT_BALANCE` | The wallet declined the stake; the round never dealt. |
| `4` | `NO_ACTIVE_ROUND` | PICK, RANDOM or CASHOUT with no round held. |
| `4` | `STALE_SCREEN` | The answer names a turn that is not the one waiting. |
| `4` | `ACTION_NOT_ALLOWED` | CASHOUT on turn 1, a slot off the board, or a payload that does not decode. |
| `4` | `CHEAT_DISABLED` | `666` where the deployment does not allow it for this account. |
| `4` | `INVALID_CHEAT` | `666` that could not make a legal round; the text names the field. |
| `91` | `BET_FAILED` | Anything the game did not classify. |

Captured `data` bodies:

```json
{"c":199,"err":1,"errc":"INVALID_BET_LEVEL","error":"Bet amount not allowed"}
{"c":199,"err":4,"errc":"NO_ACTIVE_ROUND","error":"No round is in play"}
{"c":199,"err":4,"errc":"ACTION_NOT_ALLOWED","error":"That action is not allowed on this turn"}
```

A refusal writes nothing: the round, its ordinal and its deadline are exactly as they were.

### Round history — `452`

`402` is answered by core-lib, which runs the query, pages it and keeps the retention window; HUW only names its fields on each row. `page` counts from `0`; `limit` defaults to `10`.

```json
{ "c": 452, "list": [ … ], "total": 37, "page": 0, "limit": 10 }
```

Each row is the platform's fields — `ticket_id`, `round_id` (the ten-digit display number frames carry), `uid`, `member_id`, `username`, `display_name`, `bet`, `win`, `currency`, `status`, `payment_status`, `created_at` — and the round's own:

| Field | Meaning |
| --- | --- |
| `cleared` | Columns cleared. |
| `board` | The trap masks, as in a frame. A settled round's row reveals every column; a running one only those played. |
| `turns` | Every crossing, each as a frame's `turn`. |
| `ending` | How it ended. Absent while the round runs. |

A row:

```json
{"ticket_id":"t-1","round_id":"0000000042","bet":10000,"win":12900,"status":"WIN","cleared":1,"board":[1,2,4,8,1,2,4],"turns":[{"ordinal":2,"column":1,"by":"player","action":"pick","slot":1},{"ordinal":3,"column":2,"by":"timeout","action":"cashout","presence":"away"}],"ending":"cashout_inactive"}
```

### GameYourBet — the back-office line

Not on the socket. Every payment ticket and every settled record carries `game_your_bet`, one line per round in the player's language, rendered on read from the round's stored history — never stored as text — through the `game_your_bet_*` keys in `locales/<lang>.json`:

```text
B: Roundid: #0000000042;
Bet 10000.00, Cleared 1;
Column 1: Player Pick Slot 2, Safe;
Column 2: Timeout Cashout;
Result: Cashout (away), Win 12900.00
```

Slots count 1–4 here, 0–3 on the socket. A bet ticket, requested before the deal, reads `Result: Running`. `go run ./cmd/gameyourbet -record <file>` prints the line for a stored round.

### Wallet balance — `196`

Sent by ws-service, keyed `code`, not `c`:

```json
{ "code": 196, "balance": 980.00, "scope_id": "c_huw_59", "platform_id": "platform_x" }
```

## Client rules

1. The board, every win and the total are **server-authoritative**. Display what is sent; compute nothing.
2. De-duplicate `101` frames by `(ticket_id, ordinal)` and ignore an older ordinal for the same ticket.
3. Answer with the last frame's ordinal + 1, or with the snapshot's `open.ordinal`.
4. Restart the countdown from every `deadline_ms`; never resolve a turn locally when it reaches zero. The server does, and pushes the frame.
5. Do not offer CASHOUT on turn 1.
6. Use `100` to restore a page load, then continue on `101`. Handle all four connect states.
7. Name the wallet on every connect, not only the first.

## ws-service — the edge gateway

The browser never reaches this game directly. ws-service terminates the socket, authenticates the token, enforces session limits, and bridges to the game over NATS. On top of that pass-through it sends frames of its **own**:

> **Two frame shapes, one socket.** A game frame keys its opcode `c`. A ws-service frame keys its opcode **`code`**. Route on which key is present, never on the number alone — this game's `{"c": 199}` error and ws-service's `{"code": 199}` goodbye are unrelated.

| Code | Name | When |
| --- | --- | --- |
| `102` | BALANCE_UPDATE | The primary balance moved. |
| `196` | WALLET_BALANCE_UPDATE | One per-scope wallet moved. |
| `199` | GOOD_BYE | Sent immediately before ws-service closes the connection. |
| `411` | TABLE_SESSION_LIMIT_REACHED | The session limit evicted the oldest session; paired with `199`. |

Every tab gets its own session. ws-service announces a disconnect only when the player's **last** session leaves, so a superseded tab closing is never seen by the game. That is why HUW reads presence from the session record at each lapse, never from disconnect events.
