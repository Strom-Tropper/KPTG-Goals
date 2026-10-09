# C-HUW-59 frontend integration

The packet-level contract — connection, initial state, frames, refusals and the timer — is maintained in [ws-docs.md](ws-docs.md). This is the shorter read: what a client has to get right, and why.

HUW is Hungry Wolf. One round is: PLAY at a level, the server deals a hidden layout of traps over seven columns of four slots, and the player crosses one column per turn — PICK a slot, RANDOM, or from turn 2 CASHOUT at the last cleared column's multiplier. A trap pays nothing; clearing column 7 cashes out at its multiplier automatically.

A running non-production instance serves these documents itself, on the game's own port: **`/docs`** lists them, **`/docs/ws`** is the packet reference.

## WebSocket connection

Connect to `{ws-service-url}/ws?token={token}&gameId=c_huw_59`. Include `walletProvider`, `walletPlatformId`, `walletResource` and `walletScopeIds` only when the selected wallet needs scoped routing, and then **all four**. Send them on every connect, not just the first: a reconnect that names no wallet lands on the main one.

## Client request envelope

Every request is `{ "c": <opcode>, "data": { … } }`:

| Opcode | `data` | |
| --- | --- | --- |
| `202` PLAY | `{ "level": 10000 }` | A ladder key, never an amount. |
| `203` PICK | `{ "ordinal": 2, "slot": 1 }` | `slot` is `0`–`3`. |
| `204` RANDOM | `{ "ordinal": 2 }` | The server draws the slot. |
| `205` CASHOUT | `{ "ordinal": 3 }` | Not on turn 1. |
| `206` STATE | `{}` | Re-reads the snapshot. |

**`ordinal` is the last frame's ordinal + 1** ([the ordinal contract](ws-docs.md#the-ordinal-contract)). The deal frame is ordinal 1, so turn 1 is answered with 2. On a restore, answer with the snapshot's `open.ordinal` as it stands. A wrong ordinal is refused `STALE_SCREEN` and changes nothing.

## The clock

Every waiting frame and every open snapshot carries `deadline_ms`, the absolute instant the waiting turn lapses. Count down to it from each packet. **Never resolve a turn locally when the countdown reaches zero**: the server resolves it ([the turn timer](ws-docs.md#the-turn-timer)) and pushes the frame —

- if the player is connected, as a RANDOM pick (`by: "timeout"`, `presence: "connected"`);
- if the player is away, as a cashout at the current win (`cashout_inactive`), or on turn 1 as a refund of the stake (`abandoned_at_start`).

Turn 1 has 30 s from the stake's confirmation. A later turn has the reveal delay plus 30 s from the turn before; after a lapse it runs from the lapsed deadline.

## Server frames

The server pushes one `101` per screen: `deal` (ordinal 1), then one crossing per turn. Render each from its `payload` ([status frame](ws-docs.md#status-frame--101)):

- `board` is seven trap masks, **bit `i` = slot `i` is a trap**, `null` = not revealed yet. Columns appear as they are crossed; the terminal frame reveals them all. In JavaScript, `(mask & (1 << slot)) !== 0` is "slot is a trap"; [board masks](ws-docs.md#board-masks) has a full reader.
- **Ids are 19-digit integers** (`member_id`, and any numeric id a row carries). `JSON.parse` turns them into JavaScript numbers and rounds them (`1791431636250682383` becomes `1791431636250682400`). Keep them as strings if you compare or send them back, for example by quoting them before parsing: `JSON.parse(text.replace(/"member_id":(\d{16,})/g, '"member_id":"$1"'))`.
- `current_win` is what CASHOUT pays now.
- `turn` says what resolved this crossing and who did it.
- `done: true` and `ending` close the round: `trap`, `cashout`, `cashout_inactive`, `abandoned_at_start` or `max`.

## Restoring on connect

The `100` packet's `state.state` is `idle`, `waiting`, `expired` or `unseen` ([connect state](ws-docs.md#connect-state)). `waiting` is a live round to keep playing; `expired` is a lapsed turn whose frame is on its way — show no countdown and no outcome; `unseen` is a round the server finished while the player was away, delivered **once**.

The same packet carries `game_config` ([game configuration](ws-docs.md#game-configuration--game-config)): offer `bet_levels` and send the chosen `level` in PLAY; label the columns from `multipliers_x100`. Take the timing from it for display only — every frame's `deadline_ms` is still the clock.

## History

Send `{ "c": 402, "page": 0, "limit": 10 }`; core-lib answers `452` with a page of rows, each carrying the round's `cleared`, `board`, `turns` and `ending` ([round history](ws-docs.md#round-history--452)). Page with `page` and `total`. `round_id` is the number to show a player, ten digits: a real player's comes from a shared counter that rises with gaps, a demo player's counts their own rounds from 1 and restarts when their 1 h demo history expires. Demo and real ids can coincide; `ticket_id` is the round's key.

## Errors

A `199`'s `data` carries `err`, `errc` and `error`. Show `error` and branch on `errc` ([the table](ws-docs.md#error--199)). A refused action changes nothing.

## What the client must never do

- Compute a payout, or decide whether a slot is a trap.
- Treat its own countdown as authoritative, or resolve a turn at zero.
- Retry an accepted action, or answer after the frame with `done: true`.
- Infer round state from silence: ws-service announces only the last tab's disconnect.
