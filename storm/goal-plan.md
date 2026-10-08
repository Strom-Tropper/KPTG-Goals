# Plan Goal

Push your luck. Sói đói vượt bẫy của thợ săn để bắt cừu. RTP ước tính 97%. Cảm giác chơi tham chiếu [Spribe Goal](https://spribe.co/games/goal). Sản phẩm này là một bàn cố định, không có Field Small / Medium / Large, không có Auto Game, không có mức cược USD 0.10–100.

Bàn quay slot đã xóa. `GameScene` gọi `goalEngine` rồi `GoalBoard` vẽ. Engine và socket slot còn trên đĩa. Số bàn, B Level, hệ số, và 30 giây nằm ở `src/modules/game/engine/goal-constants.ts`. Luật nằm ở `goal-engine.ts` và ghi vào `goalState`. Tiền trên CASHOUT là B Level nhân hệ số của cột vừa đi qua. Sau cột 1, mức `1,000,000` thành `1,290,000`.

## Bàn

7 cột, mỗi cột 4 ô. Sói đi từ cột trái sang cột phải. Mỗi lượt chỉ được chọn một ô trong cột đang sáng.

| Cột / bước | Hệ số |
| --- | --- |
| 1 | 1.29 |
| 2 | 1.72 |
| 3 | 2.29 |
| 4 | 3.06 |
| 5 | 4.08 |
| 6 | 5.45 |
| 7 | 7.26 |

## B Level

Người chơi chọn một mức trước khi PLAY.

`10000`, `20000`, `50000`, `100000`, `200000`, `500000`, `1000000`.

Mặc định là mức 1, `10,000`, chữ trên ô là `Bet Level 1`. Bấm cộng tăng số mức và hiện đúng số tiền của mức đó. Mức 1 khóa nút trừ. Mức 7 khóa nút cộng. Ô giữa bấm được và mở danh sách 7 mức, `Bet Level 1` đến `Bet Level 7`, kèm số tiền của mức đó. Nút Reset Bet giữ nguyên mức đang chọn. STANDBY khóa Reset Bet. Trong ván, danh sách, Reset Bet, nút History và hai nút cộng trừ khóa. Chữ trên nút khóa màu xám.

## Hai pha

### STANDBY

- Chọn B Level.
- RANDOM khóa.
- Nút chính là PLAY.
- PLAY trừ tiền và mở ván. Không đủ số dư thì ván không đổi.

### GAME

Bắt đầu khi bấm PLAY.

- Khóa B Level.
- PLAY đổi thành CASHOUT. Lượt đầu CASHOUT khóa.
- RANDOM mở.
- Cột đang chơi sáng, kèm hệ số của cột đó. Hệ số các cột đã qua giữ lại, màu xám.
- Một đồng hồ 30 giây cho cả ván, bắt đầu khi bấm PLAY, không đặt lại theo từng cột. Đồng hồ luôn hiện.
- Người chơi chọn 1 trong 4 ô của cột đó, hoặc bấm RANDOM.

RANDOM chọn một ô trong cột đang sáng. Hết 30 giây mà chưa đi ô nào thì thua, tiền cược mất, mọi ô nền hồng. Đã qua ít nhất một cột thì tự cashout số đang hiện trên nút. Nguồn random là tham số đưa vào engine.

## Kết quả một lượt

**Bẫy.** Sói chết. Ván kết thúc, về STANDBY. Tiền cược đã mất.

**An toàn.** Ô vừa chọn hiện trái bóng. Các ô an toàn của cột trước đó là dấu chấm. Tiền thắng hiện tại ghi lên nút CASHOUT. Sáng cột kế tiếp và hệ số của cột đó. CASHOUT mở, người chơi được rút.

Tiền trên nút là B Level nhân hệ số của cột vừa đi qua. Qua cột 1 thì `1,000,000` thành `1,290,000`. Wireframe vẽ `1,720,000` cạnh nhãn `1.72x` khi cột 2 đang sáng. Bảng hệ số trong rule lấy `1.29` cho cột 1.

## Ván kết thúc

| Cách | Việc |
| --- | --- |
| Dính bẫy | Cột dính bẫy trở đi nền hồng. Ô vừa bấm hiện `mark-explode`. Các ô bẫy khác hiện quả boom. Ván vào `ended` |
| Bấm CASHOUT | Nhận tiền đang hiện trên nút. Hiện mọi ô bẫy. Ván vào `ended` |
| Sống sót cột 7 | Tự cashout ở hệ số 7.26. Hiện mọi ô bẫy. Ván vào `ended` |
| Hết 30 giây, chưa đi ô nào | Thua. Không cộng tiền. Mọi ô nền hồng và hiện ô bẫy. Ván vào `ended` |
| Hết 30 giây, đã qua cột | Tự cashout số trên nút. Hiện mọi ô bẫy. Ván vào `ended` |

`ended` giữ nguyên bàn và số giây đang hiện. PLAY và Reset Bet bật. Bấm PLAY bắt đầu ván mới. Reset Bet về STANDBY: bàn và mức bet giữ nguyên, nút bet bật, PLAY khóa đến khi chọn lại mức. Chọn xong thì PLAY bật, bấm PLAY mới vào ván mới.

Lượt đầu không được cashout. Sau ô an toàn đầu tiên mới rút được.

Chưa chốt: hết ván mà số dư không đủ mức bet đang chọn thì PLAY xử lý thế nào. Hiện PLAY vẫn sáng, bấm vào chỉ báo thiếu tiền.

## Wireframe

Hai khung, ngang và dọc. Nền đen, ô bo góc.

Trên bàn: hệ số cột đã qua màu xám, hệ số cột đang tới màu sáng. Góc phải: nút `i`, nút `H`, nút `S`.

Cột đã đi: một ô bom, một ô bóng. Cột đang chơi: cả cột sáng hơn.

Thanh ngang: Balance, RANDOM, CASHOUT kèm số tiền, Bet Level với trừ và cộng.

Thanh dọc: RANDOM, nút PLAY, rồi Balance và Bet Level. Rule viết chữ trên nút chính: STANDBY là PLAY, trong ván là CASHOUT.

## Chưa có trong rule

Không bịa thêm.

- Mỗi cột có bao nhiêu bẫy, và ô nào là bẫy.
- Cách hiện bom và bóng: wireframe chỉ cho thấy cột đã xong có một bom và một bóng.
- Opcode, ai rút ô bẫy (máy chủ hay client).
- Công thức để RTP đúng 97%. Bảng hệ số đã có, xác suất bẫy thì chưa.
- Chữ trên nút `i` và `S`. Khung vẽ hai nút đó, rule không mô tả.

## Lát làm

1. Docker và nền xanh. Đã xong.
2. Hằng số bàn, B Level, hệ số, 30 giây. Đã nằm ở `src/shared/constants/goal.ts`.
3. Engine thuần. Nằm ở `src/modules/game/engine/goal-engine.ts`. Kết quả an toàn hoặc bẫy là tham số. `RandomSlot` nhận một số trong khoảng 0 đến 1.
4. Scene vẽ bàn theo wireframe: lưới 7×4, cột sáng, bom và bóng, hệ số, thanh ngang và thanh dọc. Khung mở là ảnh giữa ván. CASHOUT trên khung đó về STANDBY, chưa cộng tiền.
5. Trong ván: sáng cột, RANDOM, CASHOUT khóa rồi mở, một ô chọn đổi một kết quả.
6. Đếm 30 giây. Hết giờ thì cùng đường với RANDOM.
7. Cột 7 an toàn thì tự cashout.
8. Khung ngang và khung dọc. Nút `i` và `S` sau, khi có nội dung.

## Việc đã xóa

Bàn quay, bonus, map, spine slot, HUD slot, `LoadingView`, art slot, `public/assets`, `dist`, folder `mockup/`, và `scripts/generate-wheel-symbol-masks.mjs`. Hình Goal đang ở `raw-assets/background{m}{copy}/`, `raw-assets/icons{m}{copy}/`, và `raw-assets/board{m}{copy}/`. Ô có 3 màu: `cell-normal`, `cell-active`, `cell-explode`. Icon trên ô: `mark-ball`, `mark-bomb`, `mark-explode`, `mark-bullet`. Nút có `normal`, `hover`, `active`. Chưa chạy assetpack. Bàn nạp SVG trực tiếp.

## Chưa comment

Engine slot, handler, `audio.config.ts`, câu chữ trong `src/shared/i18n/`, và `cheat-tool.ts` vẫn là file TypeScript sống. Boot không vẽ bàn quay. `main.ts` không gọi cheat tool. Cắt khi lát engine Goal thay chỗ đó.
