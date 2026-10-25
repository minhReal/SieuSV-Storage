# Export-Import Plugin — Hướng dẫn sử dụng

Tiếng Việt · [English](%5BEN%5D%20HOW%20TO%20USE%20THIS%20PLUGINS.md)

Plugin này cho phép **xuất / nhập plugin bằng chuỗi code**, giúp bạn chia sẻ và cài plugin ngay trên điện thoại mà **không cần tạo model bằng máy tính** (khá phiền).

---

## Trước tiên: cần biết 2 khái niệm

### 1. `Part` dùng để làm gì?

Khi bạn xuất hoặc nhập một hay nhiều plugin, các ô nhập **Part** sẽ chứa phần mã bên trong từng Part.

- Dùng **Add a Part** để thêm Part mới.
- Dùng **Delete a Part** để xoá Part không cần.

### 2. `Script Sources` dùng để làm gì?

> **Giới hạn:** Plugin chưa thể sao chép mã nguồn bên trong `Script` / `LocalScript` / `ModuleScript` vì dễ gây nhiều lỗi.

---

## 1. Export (Xuất)

Nút này xuất **tất cả mọi thứ** bên trong `StarterCharacterScripts`.

Muốn xuất một object cụ thể, dùng nút **Target Object** và nhập đường dẫn, ví dụ:

```text
StarterCharacterScripts.MyPlugin
```

## 2. Import (Nhập)

Nút này nhập một plugin vào game của bạn mà không cần tạo model bằng máy tính (khá phiền).

1. Chuẩn bị **chuỗi mã** của plugin.
2. Dán chuỗi vào các ô **Part** (có thể có nhiều Part).
3. Bấm **Import** và **chờ** cho tới khi hoàn tất.

---

## Tóm tắt

| Nút | Chức năng |
| --- | --- |
| **Export** | Xuất mọi thứ trong `StarterCharacterScripts` |
| **Target Object** | Chọn một object cụ thể để xuất |
| **Add a Part** | Thêm một ô Part |
| **Delete a Part** | Xoá một ô Part |
| **Import** | Nhập plugin từ chuỗi mã |
