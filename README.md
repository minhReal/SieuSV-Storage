<div align="center">

# SieuSV-Storage

**Storage to hold plugin scripts for [SIEUSV plugins](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA)**

Plugins make building your game in Studio Lite easier!

[![Roblox](https://img.shields.io/badge/Roblox-Luau-00A2FF?logo=roblox&logoColor=white)](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA)
[![License](https://img.shields.io/badge/License-SAL--1.0-blue)](LICENSE.md)
[![Version](https://img.shields.io/badge/version-26.1-brightgreen)](#plugins)
[![Platform](https://img.shields.io/badge/platform-mobile%20%7C%20playtest-orange)](#how-to-use)

English · [Tiếng Việt](#tiếng-việt)

</div>

---

## About

**SieuSV-Storage** is the source repository for the scripts behind **SIEUSV plugins** — a collection of small, in-game "plugins" (GUI buttons + LocalScripts) that bring Studio-like tools into a running game. Each plugin lives in the `Plugins` folder of the model and is toggled with its own button.

Browse, read, copy or fork the scripts here. The ready-to-use model is on the [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).

## Plugins

| Plugin | File | Description |
| --- | --- | --- |
| **Advanced Explorer** | [`Advanced Explorer.lua`](<Advanced Explorer.lua>) | Use **Explorer** and **Properties** windows while playtesting — with search/filter and delete. |
| **Weld** | [`Weld.lua`](Weld.lua) | Tap parts to select them (highlighted & numbered), then disable to create local **Weld / WeldConstraint / Snap / Attachment / SpringConstraint / HingeConstraint** while keeping positions. *(Known bugs — WIP.)* |
| **Surface Preview** | [`Surface Preview.lua`](<Surface Preview.lua>) | Shows the **X / Y / Z** axes and surfaces of any part you select. |
| **Grip Editor** | [`Grip-Editor/`](Grip-Editor) | Edit a Tool's `Grip` with **Move / Rotate** handles and snap settings. Playtest only. |
| **Export-Import Plugin** | [`Export-Import-Plugin/`](Export-Import-Plugin) | Export/import plugins as code strings — no computer needed. Includes a how-to guide (EN/VN). |
| **Open Chat** | [`Open Chat.lua`](<Open Chat.lua>) | Toggle the Roblox chat from anywhere. |
| **Other** | [`Other/AutomaticButtonArrangement.lua`](Other/AutomaticButtonArrangement.lua) | Helper that auto-arranges plugin buttons in a 2-column scrolling grid. |

## How to use

1. Get the model from the [Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA), **or** copy a script from this repo.
2. Put the plugin GUI/button into your game (StarterGui / StarterCharacterScripts, depending on the plugin).
3. Paste the script into a `LocalScript` placed inside the plugin button/frame (the scripts use `script.Parent`).
4. Playtest and tap the button to toggle the plugin.  Green button = **ON**,  white = **OFF**.

> Making your own plugin button? I'll create some template scripts soon. lel.

## Structure

```text
SieuSV-Storage/
├── Advanced Explorer.lua
├── Open Chat.lua
├── Surface Preview.lua
├── Weld.lua
├── Grip-Editor/
│   ├── GripEditor.lua
│   └── Grip Editor Btn.lua
├── Export-Import-Plugin/
│   ├── EI Btn.lua
│   ├── EN_HOW_TO_USE_THIS_PLUGINS.md
│   └── VN_HOW_TO_USE_THIS_PLUGINS.md
├── Other/
│   └── AutomaticButtonArrangement.lua
├── LICENSE.md
└── README.md
```

## Contributing

Found a bug or want to add a plugin? Open an **Issue** or a **Pull Request**. Independent plugins you add remain the property of their creators (see the license).

## License

Licensed under the **SIEUSV Attribution License 1.0 (SAL-1.0)** — see [`LICENSE.md`](LICENSE.md).
You may use, modify and commercialize derivatives, but you **must credit the original authors** and link back to this project.

## Credits

- **minh152680 / minhminhminh6736** — [YouTube](https://www.youtube.com/@minh15268O)
- **Ba K gang** — [Roblox Group](https://www.roblox.com/communities/434674101/Ba-K-gang#!/about)

---

## Tiếng Việt

<details>
<summary><b>Bấm để xem bản tiếng Việt</b></summary>

### Giới thiệu

**SieuSV-Storage** là kho lưu trữ các script của **SIEUSV plugins** — bộ "plugin" nhỏ chạy ngay trong game (nút GUI + LocalScript), mang các công cụ giống Roblox Studio vào lúc **playtest**, dùng được cả trên **điện thoại**.

Model hoàn chỉnh có trên [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).

### Danh sách plugin

| Plugin | Chức năng |
| --- | --- |
| **Advanced Explorer** | Dùng Explorer và Properties khi đang playtest (có tìm kiếm, xoá). |
| **Weld** | Chọn các part rồi tắt plugin để tạo weld/constraint cục bộ, giữ nguyên vị trí. *(Còn lỗi.)* |
| **Surface Preview** | Xem các mặt/trục X, Y, Z của part. |
| **Grip Editor** | Chỉnh `Grip` của Tool bằng Move/Rotate. Chỉ dùng khi playtest. |
| **Export-Import Plugin** | Xuất/nhập plugin bằng chuỗi code, không cần máy tính. |
| **Open Chat** | Mở chat ở mọi nơi. |
| **Other** | Script phụ trợ sắp xếp nút tự động. |

### Cách dùng

1. Lấy model từ Creator Store hoặc copy script từ repo này.
2. Đặt GUI/nút plugin vào game của bạn.
3. Dán script vào `LocalScript` nằm trong nút/frame của plugin.
4. Playtest và bấm nút để bật/tắt (xanh lá = bật, trắng = tắt).

### Giấy phép

Theo **SIEUSV Attribution License 1.0 (SAL-1.0)** — xem [`LICENSE.md`](LICENSE.md). Bạn phải **ghi công tác giả gốc** và dẫn link về dự án này.

</details>
