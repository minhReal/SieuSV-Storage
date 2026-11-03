<div align="center">

<img src="logo2.jpg" alt="SIEUSV Plugins" width="200">

# SieuSV-Storage

**Source repository for [SIEUSV plugins](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA)**

[![Roblox](https://img.shields.io/badge/Roblox-Luau-00A2FF?logo=roblox&logoColor=white)](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA)
[![License](https://img.shields.io/badge/License-SAL--1.0-blue)](LICENSE.md)
[![Version](https://img.shields.io/badge/version-26.1-brightgreen)](#plugins)
[![Platform](https://img.shields.io/badge/platform-mobile%20%7C%20playtest-orange)](#how-to-use)

English · [Tiếng Việt](#tiếng-việt)

</div>

---

## About

**SieuSV-Storage** stores the Luau source files and metadata for **SIEUSV plugins**. The plugins are designed to make building and testing Roblox experiences in Studio Lite easier, including on mobile.

Browse, inspect, copy or fork the source files here. The ready-to-use model is available on the [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).

## Plugins

| Plugin | Description | Files |
| --- | --- | --- |
| **Advanced Explorer** | In-game Explorer and Properties interface for playtesting. | [Folder](<Studio Tools/Advanced Explorer>) |
| **Surface Preview** | Displays the X / Y / Z axes and surfaces of a selected part. | [Folder](<Studio Tools/Surface Preview>) |
| **Weld** | Select parts and create local welds and supported constraints while preserving positions. *(WIP.)* | [Folder](<Studio Tools/Weld>) |
| **Grip Editor** | Edit a Tool's `Grip` with Move / Rotate handles and snap settings. Playtest only. | [Folder](<Studio Tools/Grip Editor>) |
| **Export-Import Plugin** | Export and import plugin instances as code strings. Includes EN/VN guides. | [Folder](<Studio Tools/Export-Import Plugin>) |
| **Open Chat** | A SIEUSV plugin that toggles the Roblox chat interface. Its website tag is `Github`. | [Folder](<Sieu-SV Plugins/Open Chat>) |
| **Automatic Button Arrangement** | Automatically arranges buttons in a scrolling grid. | [Folder](<Other/Automatic Button Arrangement>) |
| **Automatically Add UIStroke** | Adds outlines to TextButtons and ImageButtons. | [Folder](<Other/Automatically Add UIStroke>) |
| **Draggable** | Adds touch and mouse dragging to supported plugin panels. | [Folder](<Other/Draggable>) |

## How to use

1. Get the asset ID from the [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).
2. Join a Studio Lite playtest.
3. Open Toolbox, paste the asset ID and select **Get**.
4. Find the **Plugins** folder in Workspace.
5. Follow the plugin's guide and place the required scripts in the specified location, usually `StarterPlayer > StarterCharacterScripts`.

Some tools are designed for playtesting only. Check each plugin's folder and README before installing it.

## Pull Request or Website

There are two ways to submit a script to SieuSV-Storage.

### Option 1 — Pull Request (GitHub)

1. Fork this repository and create a branch.
2. Put each plugin or standalone script in its own folder under an appropriate category, such as `Studio Tools/`, `Sieu-SV Plugins/` or `Other/`.
3. Add a **`SVS.json`** file (or **`svs.json`**) at the root of that script folder.
4. Add the Luau source files and any supporting documentation to the same folder.
5. Open a Pull Request against `main`. Include a short summary and note any playtest or platform limitations.

After a Pull Request is merged, the website reads its manifest and GitHub history. The script page displays a thumbnail, description and source code directly. The Information panel shows the custom tag, category, upload method, repository path, contributor profiles and collapsed PR history.

#### SVS.json format

Manifest paths are relative to the folder containing the JSON file. Use valid JSON (double quotes, no trailing commas).

```json
{
  "schema_version": 1,
  "id": "my-script",
  "title": "My Script",
  "description": "What the script does.",
  "category": "Plugins",
  "tag": "Github",
  "method": "source",
  "source": "Main.lua",
  "files": [
    { "path": "Main.lua", "role": "main" },
    { "path": "Helper.lua", "role": "helper" }
  ],
  "import_parts": [],
  "thumbnail": null
}
```

- `id`: unique, lowercase identifier.
- `title`, `description`, `category`: information shown in the library. Use `Plugins` for plugins and `Other` for utility scripts.
- `tag`: a custom display tag. Defaults to `Github` when omitted. All current repository scripts, including Open Chat, use `Github`.
- `method`: `source`, `import` or `both`.
- `source`: relative path to the main `.lua` or `.luau` file when using `source` or `both`.
- `files`: source and supporting files associated with the script. Each path is relative to the manifest folder. Use roles such as `main`, `helper`, `documentation` or `button`.
- `import_parts`: relative paths to String Import part files when using `import` or `both`.
- `thumbnail`: optional relative image path; use `null` when there is no thumbnail.

The website accepts either exact filename `SVS.json` or `svs.json`. Keep credentials, private URLs and personal information out of manifests and source files. Do not submit code you do not own or have permission to share.

### Option 2 — Website

Use the **Upload** page on the [SieuSV Library website](https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev/) to submit a community script. Sign in, add its title and description, choose **Source**, **Import** or **Both**, then publish. Website submissions are stored in the community library and do not need a GitHub folder or manifest.

## Repository structure

```text
SieuSV-Storage/
├── Studio Tools/
│   ├── Advanced Explorer/
│   │   ├── SVS.json
│   │   └── Advanced Explorer.lua
│   ├── Export-Import Plugin/
│   │   ├── SVS.json
│   │   ├── EI-Source.lua
│   │   ├── EI-Btn.lua
│   │   └── guides and README
│   ├── Grip Editor/
│   ├── Surface Preview/
│   └── Weld/
├── Other/
│   ├── Automatic Button Arrangement/
│   ├── Automatically Add UIStroke/
│   └── Draggable/
├── Sieu-SV Plugins/
│   └── Open Chat/
├── website/
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

**SieuSV-Storage** là kho lưu trữ mã nguồn Luau và metadata của **SIEUSV plugins**, hỗ trợ tạo và kiểm thử game Roblox bằng Studio Lite, kể cả trên điện thoại.

Bạn có thể xem, đọc, sao chép hoặc fork mã nguồn tại đây. Model hoàn chỉnh có trên [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).

### Danh sách plugin

| Plugin | Chức năng |
| --- | --- |
| **Advanced Explorer** | Explorer và Properties trong lúc playtest. |
| **Surface Preview** | Hiển thị trục X / Y / Z và bề mặt của part. |
| **Weld** | Tạo weld và constraint cục bộ, giữ nguyên vị trí. *(Đang phát triển.)* |
| **Grip Editor** | Chỉnh `Grip` của Tool bằng Move / Rotate. Chỉ dùng khi playtest. |
| **Export-Import Plugin** | Xuất và nhập plugin bằng chuỗi code, có hướng dẫn EN/VN. |
| **Open Chat** | Plugin SIEUSV dùng để bật / tắt giao diện chat Roblox. |
| **Automatic Button Arrangement** | Tự động sắp xếp button trong scrolling grid. |
| **Automatically Add UIStroke** | Tự thêm viền cho TextButton và ImageButton. |
| **Draggable** | Kéo thả các panel plugin bằng cảm ứng hoặc chuột. |

### Cách dùng

1. Lấy asset ID từ [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).
2. Vào playtest trong Studio Lite.
3. Mở Toolbox, dán asset ID rồi chọn **Get**.
4. Tìm thư mục **Plugins** trong Workspace.
5. Đọc hướng dẫn của từng plugin và đặt script vào đúng vị trí, thường là `StarterPlayer > StarterCharacterScripts`.

Một số công cụ chỉ hoạt động trong playtest.

### Pull Request hoặc Website

**Cách 1 — GitHub Pull Request**

1. Fork repository và tạo branch riêng.
2. Đặt mỗi plugin hoặc script độc lập trong một thư mục thuộc nhóm phù hợp, ví dụ `Studio Tools/`, `Sieu-SV Plugins/` hoặc `Other/`.
3. Thêm file **`SVS.json`** (hoặc **`svs.json`**) ở thư mục gốc của script đó.
4. Thêm mã nguồn Luau và tài liệu liên quan vào cùng thư mục.
5. Tạo Pull Request hướng đến branch `main`, kèm mô tả ngắn và các giới hạn cần biết.

Sau khi PR được merge, website đọc manifest và lịch sử GitHub. Trang script hiển thị thumbnail, mô tả và source code trực tiếp. Phần Information hiển thị tag, danh mục, phương thức tải, đường dẫn repository, contributor và lịch sử PR được thu gọn.

Manifest hỗ trợ các trường `id`, `title`, `description`, `category`, `tag`, `method`, `source`, `files`, `import_parts` và `thumbnail`. Dùng category `Plugins` cho plugin và `Other` cho tiện ích. Tag mặc định là `Github`, kể cả Open Chat. Đường dẫn trong manifest tính từ thư mục chứa file JSON.

**Cách 2 — Website**

Mở trang [SieuSV Library](https://minhreal.github.io/SieuSV-Storage/), đăng nhập rồi dùng mục **Upload**. Chọn **Source**, **Import** hoặc **Both**, điền thông tin và đăng tải. Không cần tự tạo manifest khi upload qua website.

### Giấy phép

Theo **SIEUSV Attribution License 1.0 (SAL-1.0)** — xem [`LICENSE.md`](LICENSE.md). Bạn phải ghi công tác giả gốc và dẫn link về dự án.

</details>
