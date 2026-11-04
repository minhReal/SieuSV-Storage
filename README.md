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

## Library website

The [SieuSV Library website](https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev/) combines GitHub scripts from this repository with public community uploads.

- **Search and filters:** search by script name, creator, description or keyword; filter by category and source (GitHub or Community).
- **Sorting:** browse by recently added, recently updated, most liked or title.
- **Version history:** community uploads receive a version snapshot when first published and whenever the owner saves an update. The editor can add a changelog. GitHub entries show commits that changed the script folder.
- **Reports:** signed-in users can report broken or misleading scripts, unsafe content, spam or copyright concerns. Reports are stored for review. Submissions are rate-limited and duplicate open reports are restricted.

Review source code before using it. A report is a request for review, not a guarantee that content will be removed.

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
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── bug_report.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── README.md
│   ├── manifest.md
│   └── api.md
├── Studio Tools/
│   ├── Advanced Explorer/
│   ├── Export-Import Plugin/
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
├── CONTRIBUTING.md
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

**SieuSV-Storage** là repository lưu trữ mã nguồn Luau và metadata cho **SIEUSV plugins**. Các plugin được thiết kế để hỗ trợ xây dựng, chỉnh sửa và kiểm thử trải nghiệm Roblox bằng Studio Lite, bao gồm cả môi trường sử dụng trên điện thoại.

Repository này là nơi lưu source code, manifest và tài liệu của từng plugin. Bạn có thể xem mã nguồn, sao chép, fork repository hoặc gửi đóng góp. Model đóng gói sẵn có trên [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA).

### Danh sách plugin và script

| Plugin / Script | Chức năng | Thư mục |
| --- | --- | --- |
| **Advanced Explorer** | Giao diện Explorer và Properties trong lúc playtest để kiểm tra Instance. | [Folder](<Studio Tools/Advanced Explorer>) |
| **Surface Preview** | Hiển thị trục X / Y / Z và bề mặt của Part đang chọn. | [Folder](<Studio Tools/Surface Preview>) |
| **Weld** | Chọn Part và tạo weld hoặc constraint được hỗ trợ mà vẫn giữ vị trí. *(Đang phát triển.)* | [Folder](<Studio Tools/Weld>) |
| **Grip Editor** | Chỉnh thuộc tính `Grip` của Tool bằng tay nắm Move / Rotate và thiết lập snap. Chỉ dùng trong playtest. | [Folder](<Studio Tools/Grip Editor>) |
| **Export-Import Plugin** | Xuất và nhập Instance của plugin bằng chuỗi code. Có hướng dẫn EN/VN. | [Folder](<Studio Tools/Export-Import Plugin>) |
| **Open Chat** | Plugin SIEUSV dùng để bật hoặc tắt giao diện chat Roblox. Tag trên website là `Github`. | [Folder](<Sieu-SV Plugins/Open Chat>) |
| **Automatic Button Arrangement** | Tự động sắp xếp button theo dạng scrolling grid. | [Folder](<Other/Automatic Button Arrangement>) |
| **Automatically Add UIStroke** | Tự thêm outline cho TextButton và ImageButton. | [Folder](<Other/Automatically Add UIStroke>) |
| **Draggable** | Thêm khả năng kéo thả bằng cảm ứng hoặc chuột cho các panel được hỗ trợ. | [Folder](<Other/Draggable>) |

### Cách sử dụng model trên Roblox

1. Mở [Roblox Creator Store](https://create.roblox.com/store/asset/124980373269733/SIEUSV-plugins-BETA) và sao chép Asset ID.
2. Tham gia một phiên playtest trong Studio Lite.
3. Mở Toolbox, dán Asset ID rồi chọn **Get**.
4. Tìm thư mục **Plugins** trong Workspace.
5. Mở thư mục của plugin cần dùng và đọc README hoặc hướng dẫn đi kèm.
6. Đặt từng Script / LocalScript vào đúng vị trí được hướng dẫn. Vị trí thường gặp là `StarterPlayer > StarterCharacterScripts`, nhưng không phải plugin nào cũng sử dụng vị trí này.
7. Kiểm tra Output và thử chức năng trong môi trường playtest trước khi dùng trong dự án chính.

Một số plugin phụ thuộc vào cấu trúc GUI, quyền truy cập hoặc môi trường playtest cụ thể. Không nên giả định mọi script đều hoạt động khi đặt ở cùng một vị trí.

### Website SieuSV Library

[SieuSV Library](https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev/) hiển thị script từ GitHub và script do cộng đồng đăng tải.

- **Tìm kiếm:** tìm theo tên script, tên người đăng, mô tả, category, tag hoặc từ khóa.
- **Bộ lọc:** lọc theo category và nguồn đăng, gồm GitHub hoặc Community.
- **Sắp xếp:** Recently added, Recently updated, Most liked hoặc Title A-Z.
- **Version history:** script cộng đồng có snapshot mỗi lần phát hành và mỗi lần chủ sở hữu cập nhật. Người cập nhật có thể ghi changelog để mô tả thay đổi. Script GitHub hiển thị commit history của thư mục tương ứng.
- **Report:** người dùng đã đăng nhập có thể gửi báo cáo về script bị lỗi, mô tả gây hiểu nhầm, nội dung không an toàn, spam hoặc vấn đề bản quyền. Báo cáo được lưu để kiểm tra; hệ thống giới hạn tần suất và ngăn gửi lặp báo cáo đang mở.

Report chỉ là yêu cầu xem xét, không đồng nghĩa script sẽ tự động bị gỡ. Hãy đọc và kiểm tra source trước khi sử dụng.

### Đóng góp bằng GitHub Pull Request hoặc Website

Có hai cách gửi script lên SieuSV-Storage.

#### Cách 1 — GitHub Pull Request

1. Fork repository `minhReal/SieuSV-Storage`.
2. Tạo branch riêng cho thay đổi của bạn để dễ quản lý nhiều thay đổi.
3. Tạo một thư mục riêng cho mỗi plugin hoặc script độc lập trong category phù hợp, ví dụ `Studio Tools/`, `Sieu-SV Plugins/` hoặc `Other/`.
4. Thêm file **`SVS.json`** hoặc **`svs.json`** vào thư mục gốc của script.
5. Đặt source code Luau, file phụ trợ, thumbnail và hướng dẫn cần thiết trong cùng thư mục.
6. Kiểm tra JSON hợp lệ, đường dẫn file đúng, không chứa token, mật khẩu, URL riêng tư hoặc thông tin cá nhân.
7. Mở Pull Request và đặt base branch là **`main`**. Mô tả chức năng, cách cài đặt, kết quả test và giới hạn đã biết.
8. Chờ maintainer review. Có thể cần sửa đổi trước khi PR được merge.

Sau khi PR được merge, website sẽ đọc manifest từ repository. Trang script có thể hiển thị thumbnail, mô tả, source code, category, tag, phương thức upload, đường dẫn thư mục GitHub, contributor và lịch sử Pull Request.

#### Định dạng `SVS.json`

Đường dẫn trong manifest được tính tương đối từ thư mục đang chứa file JSON. Dùng JSON hợp lệ, key và string phải có dấu ngoặc kép, không thêm dấu phẩy ở phần tử cuối.

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

Các trường chính:

| Trường | Bắt buộc | Mô tả |
| --- | --- | --- |
| `schema_version` | Khuyến nghị | Phiên bản cấu trúc manifest. Hiện dùng `1`. |
| `id` | Khuyến nghị | ID duy nhất, viết thường, dùng chữ cái, số và dấu gạch ngang. |
| `title` | Khuyến nghị | Tên hiển thị của script. |
| `description` | Không | Mô tả ngắn về chức năng. |
| `category` | Không | Category hiển thị. Dùng `Plugins` cho plugin và `Other` cho tiện ích. |
| `tag` | Không | Tag tùy chỉnh. Mặc định là `Github` nếu bỏ trống. |
| `method` | Không | `source`, `import` hoặc `both`. Mặc định là `source`. |
| `source` | Theo method | Đường dẫn tới file Lua/Luau chính khi dùng `source` hoặc `both`. |
| `files` | Khuyến nghị | Danh sách file source và file phụ. Mỗi phần tử có `path` và `role`. |
| `import_parts` | Theo method | Danh sách đường dẫn file String Import khi dùng `import` hoặc `both`. |
| `thumbnail` | Không | Đường dẫn ảnh tương đối. Dùng `null` nếu không có ảnh riêng. |

- Website chấp nhận chính xác tên file `SVS.json` hoặc `svs.json`.
- `method: "source"` cần `source` trỏ tới file Luau chính.
- `method: "import"` cần ít nhất một file trong `import_parts`.
- `method: "both"` cần cả source và import parts.
- Mỗi đường dẫn phải trỏ đến file thực sự tồn tại trong repository và nằm trong thư mục script.
- `files` có thể dùng role như `main`, `helper`, `documentation`, `button` hoặc `manifest`.
- Nếu không khai báo thumbnail hợp lệ, website sẽ sử dụng ảnh mặc định `thumDefault.jpg`.
- Không đưa secret, access token, mật khẩu, thông tin cá nhân hoặc mã nguồn không có quyền chia sẻ vào repository.

#### Cách 2 — Đăng tải bằng Website

1. Mở [SieuSV Library](https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev/).
2. Đăng nhập bằng Google.
3. Mở mục **Upload**.
4. Nhập title, description, category và thumbnail nếu cần.
5. Chọn **Source**, **Import** hoặc **Both** tùy nội dung.
6. Dán source code hoặc các String Import Part tương ứng, kiểm tra thông tin rồi đăng tải.

Script đăng bằng website được lưu trong Community Library và không cần tạo thư mục GitHub hay file manifest. Chủ sở hữu có thể chỉnh sửa script và ghi changelog ở lần cập nhật tiếp theo.

### Cấu trúc repository

```text
SieuSV-Storage/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── bug_report.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── README.md
│   ├── manifest.md
│   └── api.md
├── Studio Tools/
│   ├── Advanced Explorer/
│   ├── Export-Import Plugin/
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
├── CONTRIBUTING.md
├── LICENSE.md
└── README.md
```

### Đóng góp và báo lỗi

Bạn có thể mở [GitHub Issue](https://github.com/minhReal/SieuSV-Storage/issues) để báo lỗi hoặc đề xuất tính năng, hoặc tạo Pull Request để đóng góp trực tiếp.

Trước khi gửi thay đổi, hãy đọc [CONTRIBUTING.md](CONTRIBUTING.md)([CONTRIBUTING.md](CONTRIBUTING.md))`, hướng dẫn trong [docs/](docs/)([docs/](docs/))` và template tương ứng. Plugin độc lập do cộng tác viên tạo vẫn thuộc quyền của tác giả theo điều khoản giấy phép.

### Giấy phép

Repository sử dụng **SIEUSV Attribution License 1.0 (SAL-1.0)**. Đọc đầy đủ tại [LICENSE.md](LICENSE.md)([LICENSE.md](LICENSE.md))`.

Bạn có thể sử dụng, chỉnh sửa và thương mại hóa các sản phẩm phái sinh theo điều kiện của giấy phép, nhưng **phải ghi công tác giả gốc và dẫn liên kết trở lại dự án**.

### Credits

- **minh152680 / minhminhminh6736** — [YouTube](https://www.youtube.com/@minh15268O)
- **Ba K gang** — [Roblox Group](https://www.roblox.com/communities/434674101/Ba-K-gang#!/about)

</details>
