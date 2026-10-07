# Plan Goal

Push your luck. Sói đói vượt bẫy của thợ săn để bắt cừu. RTP ước tính 97%. Cảm giác chơi tham chiếu [Spribe Goal](https://spribe.co/games/goal). Sản phẩm này là một bàn cố định, không có Field Small / Medium / Large, không có Auto Game, không có mức cược USD 0.10–100.

Bàn quay slot đã xóa. `GameScene` đang là nền xanh. Engine và socket slot còn trên đĩa. Số trong file này lấy từ rule và wireframe `Flow UI / Wireframe C-HUW-59`. Chưa ghi vào `settings.ts`.

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

Wireframe đang chọn `1,000,000`. Nút trừ và cộng đổi mức trong danh sách này. Trong ván, hai nút đó khóa.

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
- Cột đang chơi sáng, kèm hệ số của cột đó.
- Mỗi lượt đếm ngược 30 giây.
- Người chơi chọn 1 trong 4 ô của cột đó, hoặc bấm RANDOM.

RANDOM và hết giờ cùng một đường: chọn một ô ngẫu nhiên trong cột đang sáng. Nguồn random là tham số đưa vào engine, không gọi `Math.random` trong scene.

## Kết quả một lượt

**Bẫy.** Sói chết. Ván kết thúc, về STANDBY. Tiền cược đã mất.

**An toàn.** Tiền thắng hiện tại ghi lên nút CASHOUT. Sáng cột kế tiếp và hệ số của cột đó. CASHOUT mở, người chơi được rút.

Wireframe sau bước 1, B Level `1,000,000`: cột 1 đã mở (một bom, một bóng), cột 2 sáng, nhãn `1.29x` và `1.72x`, CASHOUT hiện `1,720,000`. Số đó bằng `1,000,000 × 1.72`. Tiền trên nút là B Level nhân hệ số của bước vừa sống sót.

## Ván kết thúc

| Cách | Việc |
| --- | --- |
| Dính bẫy | Sói chết, về STANDBY |
| Bấm CASHOUT | Nhận tiền đang hiện trên nút, về STANDBY |
| Sống sót cột 7 | Tự cashout ở hệ số 7.26 |
| Hết 30 giây | Không kết thúc ván. Tự bấm RANDOM cho lượt đó |

Lượt đầu không được cashout. Sau ô an toàn đầu tiên mới rút được.

## Wireframe

Hai khung, ngang và dọc. Nền đen, ô bo góc.

Trên bàn: hệ số cột vừa qua và hệ số cột đang tới. Góc phải: nút `i` và nút `S`.

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
2. Hằng số bàn, B Level, hệ số, 30 giây. Để trong `src/shared/constants/` khi bắt đầu code. Chưa viết ở lát plan này.
3. Engine thuần: pha STANDBY hoặc GAME, cột hiện tại, chọn một ô trong cột đó, an toàn hoặc bẫy khi đã có kết quả, tiền trên CASHOUT, về STANDBY. Random nhận một nguồn từ ngoài.
4. Scene vẽ lưới 7×4, B Level, PLAY. Một cú PLAY đổi một pha.
5. Trong ván: sáng cột, RANDOM, CASHOUT khóa rồi mở, một ô chọn đổi một kết quả.
6. Đếm 30 giây. Hết giờ thì cùng đường với RANDOM.
7. Cột 7 an toàn thì tự cashout.
8. Khung ngang và khung dọc. Nút `i` và `S` sau, khi có nội dung.

## Việc đã xóa

Bàn quay, bonus, map, spine slot, HUD slot, `LoadingView`, art slot, `public/assets`, `dist`. Hình Goal đang ở `raw-assets/background{m}{copy}/` và `raw-assets/icons{m}{copy}/`. Chưa chạy assetpack.

Engine slot (`game.engine.ts`, `game.state.ts`, handler, opcode) vẫn còn. Cắt khi lát engine Goal thay chỗ đó. `cheat-tool.ts` không gọi lúc boot.
