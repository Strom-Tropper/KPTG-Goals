# Pixi-core cho người tiếp quản

File này cho PM, PO, PA, tester. AI đang viết code dùng `AGENTS.md`, không cần đọc file này.

Đọc file này nếu bạn là PM, PO, PA, tester, hoặc người nhận project mà không cần mở code. Chi tiết cho người viết code nằm ở `architecture.md`. Luật làm việc của AI nằm ở `how-we-work.md`.

## Project này là gì

Đây là khung game có sẵn của công ty. Keno sẽ được làm bên trong khung đó, không phải một app mới, và không copy prototype Goal sang.

Prototype Goal nằm ở folder `Demo html`, cạnh repo này. Đó là bản tham khảo một game khác (ô mìn, cash out). Nó cho ý về số dư, mức cược, tiếng, và popup kết quả. Luật mìn và cách lưu điểm bằng file JSON không mang sang Keno.

## Một câu

Luật chơi và màn hình là hai việc khác nhau.

Màn hình vẽ những gì người chơi thấy và nhận cú bấm. Luật trả lời được chọn thêm không, rút số nào, trúng bao nhiêu, trả bao nhiêu. Nút bấm không tự quyết những câu đó.

## Nhìn repo theo việc, không theo tên folder

| Tầng | Việc | Ví dụ người dùng thấy |
| --- | --- | --- |
| Khung chạy | Mở game, co giãn màn hình | Game vừa cửa sổ, một cỡ thiết kế 1920×1080 |
| Luật và trạng thái | Ván đang thế nào, được phép làm gì | Số đã chọn, số đã rút, tiền, mức cược |
| Màn hình | Vẽ bàn, nút, chữ, popup | Lưới số, nút chơi, hộp kết quả |
| Hạ tầng | Hình, câu chữ, tiếng, cách tạo hình | Không có chữ cứng trong nút, tiếng đi một chỗ |

Bốn chỗ Keno đụng nhiều nhất:

1. Luật
2. Trạng thái ván (tiền, số đang chọn, số đã rút)
3. Màn chơi
4. Cấu hình (giới hạn, bảng trả) sau khi spec đã ghi số

## Những số chưa được chốt

Chưa có trong tài liệu: bộ số gồm bao nhiêu ô, người chơi được chọn tối đa bao nhiêu, mỗi ván rút bao nhiêu, trả thưởng thế nào, bước cược là bao nhiêu.

Chưa có năm số này thì chưa làm màn hình Keno. Một ví dụ nói chuyện ("chọn 10 số", "lưới 80 số") không phải spec. PO hoặc PM ghi năm số đó thành một file ngắn trong `storm/` trước khi code màn chơi.

## Khi người chơi bấm một ô

1. Màn hình nhận cú bấm.
2. Luật trả lời hợp lệ hoặc không.
3. Hợp lệ thì trạng thái ván đổi.
4. Màn hình vẽ lại và phát tiếng.

Bấm khi đã đủ số, hoặc khi không đủ tiền, thì ván không đổi. Tester coi đó là một case, không phải lỗi vẽ.

## Tester kiểm tra gì

- Chọn ô, bỏ chọn ô, và dừng đúng ở giới hạn đã chốt trong spec.
- Không chọn quá giới hạn, không chơi khi không đủ tiền: màn hình giữ nguyên ván.
- Sau một ván thử: số đã chọn, số được rút, và tiền khớp với bảng trả đã chốt.
- Chữ trên nút đổi theo ngôn ngữ, không có câu tiếng Anh gắn cứng nếu bản dịch đã có.
- Tiếng bấm và nhạc đi từ một chỗ bật tắt, không mỗi nút một file tiếng riêng.
- Desktop, bề ngang máy tính bảng, và bề ngang hẹp: chữ đọc được, nút bấm được, không cắt chữ, popup nằm trong màn hình.
- Nhìn một khung hình đầu là chưa đủ. Phải bấm qua hành động đó.

Báo lỗi theo việc người chơi làm ("chọn ô thứ 11 vẫn được") chứ theo tên file.

## PO và PM chốt gì trước khi code

- Năm số ở trên.
- Một ván mẫu: chọn gì, rút gì, tiền trước, tiền sau.
- Những gì lấy từ prototype Goal (ý về cược và popup) và những gì để lại (mìn, cash out, đổi theme, lưu điểm bằng JSON).

Một thay đổi nhỏ cần một hành động, một đổi trạng thái, một kết quả nhìn thấy, rồi mới sang hành động tiếp.

## PA đưa hình và chữ vào đâu

Hình gốc để trong `raw-assets/`. Không sửa hình trong `public/assets/`. Folder đó là file máy sinh ra.

Thêm một hình cho tiếng Anh thì các ngôn ngữ khác cần file cùng tên. Đuôi file được khác nhau.

Câu người chơi đọc để trong phần đa ngôn ngữ, không ghi thẳng lên nút.

## Chạy thử

Từ folder `storm` trong repo:

```bash
docker compose up
```

Mở `http://localhost:8090`. Cách này chưa được kiểm tra trên máy. Người dev cũng có thể chạy `npm run dev` trong repo. Cổng vẫn là 8090.

## Việc AI không được tự làm

- Bịa bảng trả hoặc giới hạn chọn.
- Copy nguyên prototype Goal vào Keno.
- Thêm thư viện mới cho giống README.
- Sửa phần nối máy chủ khi task không phải phần mạng.
- Nhét luật chơi vào nút, vào màn hình, hoặc vào script build.
