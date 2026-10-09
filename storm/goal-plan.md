# Plan Goal

Sói đói đi từ trái sang phải, mỗi cột chọn một ô. Server đặt bom lúc bấm PLAY. Client chỉ gửi lựa chọn và vẽ theo tin server trả.

Bàn 7 cột, mỗi cột 4 ô, mỗi cột một bom. Hệ số cột 1 đến 7: `1.29`, `1.72`, `2.29`, `3.06`, `4.08`, `5.45`, `7.26`.

Mức bet: `10000`, `20000`, `50000`, `100000`, `200000`, `500000`, `1000000`. Chữ trên ô là `Bet Level 1` đến `Bet Level 7` kèm số tiền. Mức 1 khóa nút trừ. Mức 7 khóa nút cộng.

Ba pha: `standby`, `playing`, `ended`.

## Nút nào bật

Đang chờ server trả lời thì mọi nút khóa. Server từ chối thì bàn không đổi, chỉ hiện câu lỗi.

Chọn bet gồm bấm cộng, trừ, hoặc một dòng trong danh sách, kể cả chọn lại đúng mức đang hiện. Chưa chọn thì PLAY tắt.

### Chưa vào ván

| Nút | Vừa vào game | Đã chọn bet | Sau Reset Bet |
| --- | --- | --- | --- |
| PLAY | tắt | bật | tắt, chọn lại bet thì bật |
| RANDOM | tắt | tắt | tắt |
| Reset Bet | tắt | tắt | tắt |
| Bet, cộng, trừ | bật | bật | bật |
| History | bật | bật | bật |
| Ô trên bàn | không bấm | không bấm | không bấm |

### Đang chơi

| Nút | Chưa qua cột nào | Đã qua ít nhất một cột |
| --- | --- | --- |
| CASHOUT | tắt | bật, hiện số tiền |
| RANDOM | bật | bật |
| Reset Bet | tắt | tắt |
| Bet, cộng, trừ | tắt, chữ xám | tắt, chữ xám |
| History | tắt | tắt |
| Ô trên bàn | chỉ cột đang sáng | chỉ cột đang sáng |

### Hết ván

| Nút | Trạng thái |
| --- | --- |
| PLAY | bật |
| RANDOM | tắt |
| Reset Bet | bật |
| Bet, cộng, trừ | tắt, chữ xám |
| History | bật |
| Ô trên bàn | không bấm |

## Một ván

1. Chọn mức bet. Bấm PLAY. Client gửi `202`.
2. Server đặt bom, giấu, trả `101`. Cột 1 sáng. Các ô trống. Đồng hồ bắt đầu đếm.
3. User bấm một ô, hoặc RANDOM, hoặc CASHOUT khi đã qua ít nhất một cột.
4. Client gửi lượt đang mở và ô đã chọn. Không gửi số cột. Server biết lượt đó là cột nào.
5. Server so với bom đã đặt rồi trả `101`.
6. An toàn: ô vừa bấm là bóng, các ô an toàn trước đó là chấm. Cột đó chưa vẽ bom. Sáng cột kế. Số trên CASHOUT là tiền đang rút được. CASHOUT mở.
7. Hết ván thì vào `ended`. Bàn và số giây đang hiện giữ nguyên. PLAY và Reset Bet bật.

Bấm PLAY lúc `ended` gửi `202` với mức bet đang chọn. Khung ván mới xóa dấu ván cũ.

Reset Bet không gửi server. Pha về `standby`, giữ mức bet, giữ bàn, giữ số giây. PLAY tắt. Chọn lại bet thì PLAY bật. Bấm PLAY mới xóa bàn và mở ván mới.

## Hết ván thì vẽ gì

Đang chơi chỉ vẽ dấu ô đã chọn. Bom hiện khi ván kết thúc, kể cả cột đã đi và cột chưa đi.

| Cách hết | Cột đã đi | Cột chưa đi | Bom |
| --- | --- | --- | --- |
| Đi hết 7 cột | dấu, nền thường | không còn | hiện hết |
| CASHOUT | dấu, nền thường | nền đỏ | hiện hết |
| Đạp trúng bom | dấu, nền thường | từ cột trúng nền đỏ, ô vừa bấm là nổ | hiện hết |
| Hết giờ, chưa đi ô nào | — | mọi ô nền đỏ | hiện hết |
| Hết giờ, đã qua cột | dấu, nền thường | nền đỏ | hiện hết |

Đồng hồ luôn hiện khi còn số giây. Đang chơi thì đếm tới mốc giờ server gửi. Về 0 client không tự xử thắng thua. Server hết giờ thì tự trả `101`: người còn nối thì server tự chọn một ô; người rời máy ở lượt đầu thì hoàn tiền cược; người rời máy sau đó thì tự cashout số đang có.

Chưa chốt: hết ván mà số dư không đủ mức bet đang chọn thì PLAY xử lý thế nào. Hiện PLAY vẫn sáng, bấm vào server từ chối và báo thiếu tiền.

## Client gửi, server trả

Số là field `c` của gói.

### Client gửi

| Mã | Bấm | Gửi |
| --- | --- | --- |
| 202 | PLAY | `level`, ví dụ `10000`. Mã mức, không phải số tiền |
| 203 | một ô | `ordinal`, `slot` từ `0` đến `3` |
| 204 | RANDOM | `ordinal` |
| 205 | CASHOUT | `ordinal`. Không gửi ở lượt đầu |
| 206 | xem lại ván | `{}` |
| 402 | lịch sử | `page`, `limit` |

### Server trả

| Mã | Lúc nào | Client làm |
| --- | --- | --- |
| 100 | vừa nối | hiện mức bet và bàn |
| 101 | sau PLAY, sau mỗi ô, RANDOM, CASHOUT, hoặc hết giờ | vẽ bàn |
| 206 | trả lời mã 206 | vẽ lại bàn, cùng dạng với 100 |
| 196 | số dư đổi | sửa Balance |
| 199 | từ chối | không đổi bàn, hiện câu lỗi |
| 452 | trả lời mã 402 | hiện danh sách ván |

Hết ván, gói 101 có `done` và một lý do: `trap`, `cashout`, `cashout_inactive`, `abandoned_at_start`, `max`.

`ordinal` gửi đi bằng số lượt của khung vừa nhận cộng 1. Khung chia bài là lượt 1, nên ô đầu tiên gửi `ordinal` 2. Gửi sai lượt thì server từ chối, bàn không đổi.

Một vòng bấm ô là 203 đi, 101 về. PLAY là 202 đi, 101 về với bom còn giấu. Cột vừa đi thì mask cột đó hết `null`: bit `i` bật nghĩa là ô `i` là bom. `turn.trap` là true thì ô vừa bấm nổ. Không có `trap` thì ô đó an toàn. Hai thứ này là một kết quả từ server.
