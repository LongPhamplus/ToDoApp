# 📋 Kế Hoạch Phát Triển Todo App

> **Ngày lập kế hoạch:** 22/02/2026  
> **Cập nhật:** 23/02/2026 — Thêm kế hoạch Authentication  
> **Công nghệ:** Nuxt 4 (Vue 3 + TypeScript)  
> **Mục tiêu:** Xây dựng ứng dụng quản lý công việc hoàn chỉnh, đẹp mắt, dễ sử dụng

---

## 🔐 Kế Hoạch Authentication (Ưu tiên cao)

### Tổng quan

Hệ thống xác thực **tự xây dựng** (custom) sử dụng:
- **JWT** (JSON Web Token) — lưu trong `httpOnly cookie` (bảo mật hơn localStorage)
- **bcrypt** — hash password phía server
- **Nuxt server middleware** — bảo vệ API routes
- **Nuxt route middleware** — redirect chưa đăng nhập về `/login`
- **Pinia `useAuthStore`** — quản lý trạng thái user phía client

> Không dùng NextAuth / Supabase / Firebase để giữ kiểm soát hoàn toàn và tránh phụ thuộc external.

---

### 📦 Packages cần cài thêm

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

| Package | Vai trò |
|---|---|
| `bcryptjs` | Hash & verify password (pure JS, không cần native binding) |
| `jsonwebtoken` | Tạo & verify JWT token |

---

### 🗄️ Phase 1 — Database: User Model

**File:** `server/models/User.ts`

```typescript
UserSchema {
  email:        String (unique, required, lowercase)
  passwordHash: String (required, không trả về client)
  name:         String (required)
  avatar:       String (optional, URL)
  createdAt:    Date (auto)
  updatedAt:    Date (auto)
}
```

**Quan trọng:** Mỗi `Todo` và `Category` sẽ thêm field `userId: ObjectId` (ref User) để data cô lập theo user.

---

### 🔌 Phase 2 — API Routes

#### Auth endpoints

| Method | Route | Mô tả |
|---|---|---|
| `POST` | `/api/auth/register` | Tạo tài khoản mới |
| `POST` | `/api/auth/login` | Đăng nhập, trả về JWT trong cookie |
| `POST` | `/api/auth/logout` | Xóa cookie |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại từ token |

#### Logic register (`/api/auth/register.post.ts`)
1. Validate email + password (zod) — password tối thiểu 8 ký tự
2. Kiểm tra email đã tồn tại chưa
3. `bcrypt.hash(password, 12)`
4. Tạo User document
5. Tạo JWT: `jwt.sign({ userId, email }, secret, { expiresIn: '7d' })`
6. Set `httpOnly cookie` chứa token
7. Trả về user info (không có passwordHash)

#### Logic login (`/api/auth/login.post.ts`)
1. Validate email + password
2. Tìm user theo email
3. `bcrypt.compare(password, user.passwordHash)`
4. Nếu sai → 401
5. Tạo JWT mới → set cookie
6. Trả về user info

#### Logic me (`/api/auth/me.get.ts`)
1. Đọc token từ cookie
2. `jwt.verify(token, secret)`
3. Tìm user theo `userId` trong payload
4. Trả về user (không có passwordHash)

---

### 🛡️ Phase 3 — Server Middleware: Bảo vệ API

**File:** `server/middleware/auth.ts`

```typescript
// Chặn tất cả /api/* trừ /api/auth/*
// 1. Đọc cookie 'auth_token'
// 2. jwt.verify() → lấy userId
// 3. Gắn vào event context: event.context.userId = userId
// 4. Nếu không có token → 401
```

Các route hiện tại (`/api/todos`, `/api/categories`) sẽ tự động được bảo vệ, và query theo `userId` trong context.

---

### 🔗 Phase 4 — Migrate Data: Thêm userId vào Todo & Category

**Thay đổi model:**
- `Todo.ts` — thêm `userId: { type: ObjectId, ref: 'User', required: true }`
- `Category.ts` — thêm `userId: { type: ObjectId, ref: 'User', required: true }`

**Thay đổi API handlers:** Tất cả queries thêm `{ userId: event.context.userId }` vào filter.

**Seed logic:** `seedCategories.ts` nhận `userId` param → seed riêng cho từng user lần đầu đăng ký.

---

### 🖥️ Phase 5 — Pages & Components

#### Pages mới

| File | Mô tả |
|---|---|
| `app/pages/login.vue` | Form đăng nhập |
| `app/pages/register.vue` | Form đăng ký |

#### Layout thay đổi
- `app/layouts/default.vue` — hiển thị avatar + tên user + nút logout ở sidebar
- Ẩn sidebar hoàn toàn trên `/login` và `/register` (dùng layout riêng hoặc `definePageMeta({ layout: 'auth' })`)

**File:** `app/layouts/auth.vue` — layout trắng tối giản cho login/register

#### Store mới

**File:** `app/stores/auth.ts`

```typescript
useAuthStore() {
  state: {
    user: { _id, email, name, avatar } | null
    loading: boolean
  }
  actions: {
    fetchMe()    // GET /api/auth/me
    login(email, password)    // POST /api/auth/login
    register(name, email, password)  // POST /api/auth/register
    logout()     // POST /api/auth/logout + clear state
  }
  getters: {
    isLoggedIn: boolean
    userName: string
  }
}
```

#### Composable

**File:** `app/composables/useAuth.ts` — wrapper tiện ích gọi `useAuthStore()`

---

### 🚦 Phase 6 — Route Middleware: Guard Navigation

**File:** `app/middleware/auth.ts` (global)

```typescript
// Chạy trước mỗi route change
// Nếu chưa login và route không phải /login hoặc /register → redirect /login
// Nếu đã login và vào /login hoặc /register → redirect /home
```

---

### 🎨 Phase 7 — UI Pages

#### `/login` — Trang đăng nhập
- Logo + tên app
- Email input + Password input (show/hide toggle)
- "Remember me" checkbox (extend token 30d)
- Nút "Sign in" với loading state
- Link "Don't have an account? Register"
- Error message nếu sai credentials

#### `/register` — Trang đăng ký
- Full name + Email + Password + Confirm password
- Password strength indicator
- Nút "Create account" với loading state
- Link "Already have an account? Login"
- Auto-login sau khi register thành công

---

### 📋 Checklist thực hiện

```
Phase 1 — Model
[ ] Tạo server/models/User.ts
[ ] Cập nhật server/models/Todo.ts (thêm userId)
[ ] Cập nhật server/models/Category.ts (thêm userId)

Phase 2 — API Auth
[ ] server/api/auth/register.post.ts
[ ] server/api/auth/login.post.ts
[ ] server/api/auth/logout.post.ts
[ ] server/api/auth/me.get.ts

Phase 3 — Server Middleware
[ ] server/middleware/auth.ts (protect /api/*)
[ ] Cập nhật nuxt.config.ts (thêm JWT secret vào runtimeConfig)

Phase 4 — Migrate APIs
[ ] Cập nhật /api/todos/* — filter theo userId
[ ] Cập nhật /api/categories/* — filter theo userId
[ ] Cập nhật seedCategories.ts — nhận userId

Phase 5 — Client Store
[ ] app/stores/auth.ts
[ ] app/composables/useAuth.ts

Phase 6 — Route Guard
[ ] app/middleware/auth.ts (global guard)

Phase 7 — UI
[ ] app/layouts/auth.vue
[ ] app/pages/login.vue
[ ] app/pages/register.vue
[ ] Cập nhật app/layouts/default.vue (user info + logout)
```

---

### ⚠️ Lưu ý quan trọng

1. **JWT Secret** phải được lưu trong `.env` → `NUXT_JWT_SECRET=...` (không commit lên git)
2. **Cookie settings:** `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`, `maxAge: 604800` (7 ngày)
3. **Data migration:** Nếu đã có data cũ trong MongoDB không có `userId`, cần migration script hoặc accept data cũ là "anonymous"
4. **Không** hash password phía client — luôn gửi plaintext qua HTTPS rồi hash server-side
5. **Refresh token** — có thể bổ sung sau nếu cần (hiện tại dùng long-lived JWT 7d là đủ)

---



## 🛠️ Công Nghệ Sử Dụng

| Thành phần       | Công nghệ                          |
| ----------------- | ----------------------------------- |
| Framework         | **Nuxt 4**                          |
| Ngôn ngữ          | **TypeScript**                      |
| UI Framework      | **Nuxt UI** (dựa trên Tailwind CSS) |
| State Management  | **Pinia**                           |
| Icons             | **Nuxt Icon** (Iconify)             |
| Animations        | **VueUse Motion** (Vue Motion One)  |
| Database          | **MongoDB** (MongoDB Atlas)         |
| ORM/ODM           | **Mongoose**                        |
| API               | **Nuxt Server API Routes**          |
| Validation        | **Zod** (Schema validation)         |
| Notifications     | **Web Notifications API** + **VueUse** |
| Scheduler         | **node-cron** (backend scheduling)  |
| Lưu trữ dự phòng | **Local Storage** (offline mode)    |
| Font              | **Inter** hoặc **Geist Sans**       |

---

## 📦 Cấu Trúc Dự Án

```
ToDoApp/
├── app.vue                     # Root layout (cũ - xóa sau)
├── nuxt.config.ts              # Cấu hình Nuxt
├── package.json
├── tsconfig.json
├── .env                        # Environment variables (MongoDB URI)
│
├── app/                        # 📁 Nuxt 4: Thư mục chính cho app
│   ├── app.vue                 # Root layout (được mount tại #__nuxt)
│   │
│   ├── components/             # Vue components (auto-imported)
│   │   ├── TodoHeader.vue
│   │   ├── TodoForm.vue
│   │   ├── TodoFilters.vue
│   │   ├── TodoList.vue
│   │   ├── TodoItem.vue
│   │   ├── TodoSubTask.vue
│   │   ├── TodoStats.vue
│   │   ├── ThemeToggle.vue
│   │   ├── NotificationManager.vue
│   │   └── CategoryManager.vue
│   │
│   ├── composables/            # Composable functions (auto-imported)
│   │   ├── useTodos.ts
│   │   ├── useCategories.ts
│   │   └── useNotifications.ts
│   │
│   ├── pages/                  # Route pages (auto-route)
│   │   └── index.vue           # GET /
│   │
│   ├── stores/                 # Pinia stores
│   │   ├── todo.ts
│   │   └── category.ts
│   │
│   └── types/                  # TypeScript types (shared)
│       └── todo.ts
│
├── assets/                     # Static assets
│   └── css/
│       └── main.css
│
├── public/                     # Public static files
│   └── favicon.ico
│
├── server/                     # Nitro server (backend)
│   ├── api/                    # API routes
│   │   ├── todos/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   ├── [id].delete.ts
│   │   │   └── upcoming.get.ts
│   │   ├── categories/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].put.ts
│   │   │   └── [id].delete.ts
│   │   └── health.get.ts
│   │
│   ├── models/                 # Mongoose models
│   │   ├── Todo.ts
│   │   └── Category.ts
│   │
│   ├── utils/                  # Server utilities
│   │   ├── mongoose.ts
│   │   └── seedCategories.ts
│   │
│   └── middleware/             # Nitro middleware
│       └── seed.ts
│
└── .nuxt/                      # Build output (gitignore)
```

---

## ✨ Danh Sách Chức Năng

### 1️⃣ Chức Năng Cơ Bản (CRUD)

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 1.1 | Tạo công việc                 | Nhập tiêu đề, mô tả, yêu cầu kèm theo                 | 🔴 Cao      |
| 1.2 | Xem danh sách công việc       | Hiển thị tất cả công việc dưới dạng danh sách/card      | 🔴 Cao      |
| 1.3 | Chỉnh sửa công việc           | Sửa tiêu đề, mô tả, yêu cầu của công việc đã tạo      | 🔴 Cao      |
| 1.4 | Xóa công việc                 | Xóa bỏ công việc (có xác nhận trước khi xóa)           | 🔴 Cao      |
| 1.5 | Đánh dấu hoàn thành           | Tích chọn/bỏ tích để đánh dấu hoàn thành               | 🔴 Cao      |

### 2️⃣ Chức Năng Nâng Cao

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 2.1 | Mức độ ưu tiên               | 3 mức: Cao (đỏ), Trung bình (vàng), Thấp (xanh)       | 🟡 TB       |
| 2.2 | Phân loại danh mục            | Quản lý categories tùy chỉnh (CRUD)                    | � Cao      |
| 2.3 | Hạn hoàn thành (Deadline)     | Chọn ngày deadline, cảnh báo khi quá hạn               | � Cao      |
| 2.4 | Sub-tasks (Công việc con)     | Thêm checklist con cho mỗi công việc                   | 🟡 TB       |
| 2.5 | Ghi chú / Yêu cầu kèm theo  | Thêm nhiều yêu cầu (requirements) cho mỗi task         | 🔴 Cao      |

### 3️⃣ Tìm Kiếm & Lọc

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 3.1 | Tìm kiếm                     | Tìm theo tiêu đề hoặc mô tả                           | 🟡 TB       |
| 3.2 | Lọc theo trạng thái           | Tất cả / Đang làm / Hoàn thành                         | 🟡 TB       |
| 3.3 | Lọc theo ưu tiên              | Cao / Trung bình / Thấp                                | 🟢 Thấp    |
| 3.4 | Lọc theo danh mục             | Theo từng danh mục đã tạo                              | 🟢 Thấp    |
| 3.5 | Sắp xếp                      | Theo ngày tạo, deadline, ưu tiên, tên                  | 🟢 Thấp    |

### 4️⃣ Giao Diện & Trải Nghiệm

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 4.1 | Dark / Light mode             | Chuyển đổi giao diện sáng/tối (Glassmorphism)         | � Cao      |
| 4.2 | Responsive                    | Tương thích trên mobile, tablet, desktop               | � Cao      |
| 4.3 | Micro-interactions            | Animation mượt khi thêm/xóa/hoàn thành task           | 🔴 Cao      |
| 4.4 | Visual Feedback               | Progress bar/circle, badges, statistics                | � Cao      |
| 4.5 | Animated Tabs                 | Tab slider animation cho filters                       | 🔴 Cao      |
| 4.6 | Input nổi bật                | Sticky input bar với glassmorphism                     | 🔴 Cao      |
| 4.7 | Empty States                  | Illustrations + quotes khi không có tasks              | 🔴 Cao      |
| 4.8 | Drag & Drop sắp xếp          | Kéo thả để sắp xếp thứ tự công việc                   | 🟢 Thấp    |
| 4.9 | Thông báo Toast               | Toast notifications với animation                      | 🟡 TB       |

### 5️⃣ Dữ Liệu & Thống Kê

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 5.1 | Lưu MongoDB                   | Dữ liệu lưu trên MongoDB Atlas (cloud database)        | 🔴 Cao      |
| 5.2 | Offline mode với Local Storage| Đồng bộ với Local Storage khi offline                  | 🟡 TB       |
| 5.3 | Thống kê tổng quan            | Tổng task, hoàn thành, còn lại, quá hạn               | 🟡 TB       |
| 5.4 | Thanh tiến trình               | Progress bar hiển thị % hoàn thành                     | 🟡 TB       |
| 5.5 | Xuất dữ liệu                 | Export danh sách ra file JSON                          | 🟢 Thấp    |
| 5.6 | Nhập dữ liệu                 | Import từ file JSON                                    | 🟢 Thấp    |

### 6️⃣ Thông Báo & Cảnh Báo

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 6.1 | Browser Notifications         | Thông báo trình duyệt (yêu cầu permission)             | 🔴 Cao      |
| 6.2 | Cảnh báo deadline             | Thông báo tasks sắp hết hạn (1 ngày, 3 giờ, 1 giờ)    | 🔴 Cao      |
| 6.3 | Cảnh báo quá hạn              | Thông báo tasks đã quá hạn chưa hoàn thành            | 🔴 Cao      |
| 6.4 | Tùy chỉnh thông báo          | Bật/tắt thông báo, chọn thời gian cảnh báo            | 🟡 TB       |
| 6.5 | Âm thanh thông báo           | Phát âm thanh khi có thông báo quan trọng             | 🟢 Thấp    |
| 6.6 | Thông báo in-app             | Banner/Toast thông báo trong app                       | 🟡 TB       |

### 7️⃣ Quản Lý Danh Mục (Categories)

| #   | Chức năng                     | Mô tả                                                  | Độ ưu tiên |
| --- | ----------------------------- | ------------------------------------------------------- | ----------- |
| 7.1 | Tạo category mới              | Thêm danh mục tùy chỉnh (tên, màu sắc, icon)           | 🔴 Cao      |
| 7.2 | Sửa category                  | Chỉnh sửa tên, màu, icon của danh mục                  | 🔴 Cao      |
| 7.3 | Xóa category                  | Xóa danh mục (chuyển tasks sang "Khác")                | 🔴 Cao      |
| 7.4 | Danh sách categories          | Xem tất cả danh mục với số lượng task mỗi loại        | 🔴 Cao      |
| 7.5 | Màu sắc tùy chỉnh            | Chọn màu cho mỗi category (color picker)               | 🟡 TB       |
| 7.6 | Icon tùy chỉnh               | Chọn icon từ Iconify cho category                      | � TB       |
| 7.7 | Sắp xếp categories            | Kéo thả để sắp xếp thứ tự hiển thị                    | �🟢 Thấp    |
| 7.8 | Categories mặc định           | Công việc, Cá nhân, Học tập, Mua sắm (có sẵn)         | 🔴 Cao      |

---

## 🗂️ Cấu Trúc Dữ Liệu (TypeScript)

```typescript
// types/todo.ts

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Requirement {
  id: string
  content: string
}

interface Category {
  _id?: string
  id: string
  name: string
  color: string              // Hex color code
  icon: string               // Iconify icon name
  order: number              // Thứ tự hiển thị
  isDefault: boolean         // Category mặc định (không xóa được)
  createdAt: string
  updatedAt: string
}

interface Todo {
  _id?: string                    // MongoDB ObjectId
  id: string                      // Client-side ID
  title: string
  description: string
  requirements: Requirement[]     // Yêu cầu kèm theo
  subTasks: SubTask[]             // Công việc con
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  categoryId: string              // Reference đến Category._id
  category?: Category             // Populated category
  deadline: string | null         // ISO date string
  notificationSent: boolean       // Đã gửi thông báo chưa
  notifiedAt: string | null       // Thời gian gửi thông báo
  createdAt: string               // ISO date string
  updatedAt: string               // ISO date string
}

// Mongoose Schema structure
interface TodoDocument extends Document {
  title: string
  description: string
  requirements: Requirement[]
  subTasks: SubTask[]
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  categoryId: mongoose.Types.ObjectId
  deadline: Date | null
  notificationSent: boolean
  notifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface CategoryDocument extends Document {
  name: string
  color: string
  icon: string
  order: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Notification settings
interface NotificationSettings {
  enabled: boolean
  deadlineWarnings: {
    oneDayBefore: boolean
    threeHoursBefore: boolean
    oneHourBefore: boolean
  }
  overdueReminders: boolean
  soundEnabled: boolean
}

type FilterStatus = 'all' | 'active' | 'completed'
type SortBy = 'createdAt' | 'deadline' | 'priority' | 'title'
type SortOrder = 'asc' | 'desc'

interface TodoFilters {
  search: string
  status: FilterStatus
  priority: 'all' | 'high' | 'medium' | 'low'
  categoryId: string | 'all'     // Filter by category ID
  sortBy: SortBy
  sortOrder: SortOrder
}
```

---

## 📐 Thiết Kế Giao Diện (Wireframe)

```
┌──────────────────────────────────────────────────┐
│  🎯 Todo App                    [🌙 Dark Mode]   │
├──────────────────────────────────────────────────┤
│                                                    │
│  ┌─ Thống Kê ───────────────────────────────┐    │
│  │  📊 Tổng: 12  ✅ Xong: 5  📝 Còn: 7  ⚠️ Quá hạn: 2 │
│  │  [████████████░░░░░░░░] 42% hoàn thành    │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  ┌─ Tạo Công Việc Mới ──────────────────────┐    │
│  │  Tiêu đề: [________________________]      │    │
│  │  Mô tả:   [________________________]      │    │
│  │  Yêu cầu: [________________] [+ Thêm]     │    │
│  │            • Yêu cầu 1           [x]       │    │
│  │            • Yêu cầu 2           [x]       │    │
│  │  Ưu tiên: [Cao ▼]  Danh mục: [Công việc ▼]│   │
│  │  Deadline: [📅 Chọn ngày]                  │    │
│  │                          [✚ Tạo Công Việc] │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  ┌─ Bộ Lọc ─────────────────────────────────┐    │
│  │  🔍 [Tìm kiếm...]                         │    │
│  │  [Tất cả] [Đang làm] [Hoàn thành]         │    │
│  │  Ưu tiên: [Tất cả ▼]  Danh mục: [Tất cả ▼]│  │
│  │  Sắp xếp: [Ngày tạo ▼] [↑↓]              │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  ┌─ Danh Sách ──────────────────────────────┐    │
│  │                                            │    │
│  │  ┌─────────────────────────────────────┐  │    │
│  │  │ ☐ 🔴 Hoàn thành báo cáo            │  │    │
│  │  │   📝 Viết báo cáo Q4 cho sếp       │  │    │
│  │  │   📋 Yêu cầu: 3  |  📅 25/02/2026  │  │    │
│  │  │   🏷️ Công việc    [✏️] [🗑️]         │  │    │
│  │  └─────────────────────────────────────┘  │    │
│  │                                            │    │
│  │  ┌─────────────────────────────────────┐  │    │
│  │  │ ✅ 🟡 Đi siêu thị          ──────  │  │    │
│  │  │   📝 Mua đồ cho tuần mới           │  │    │
│  │  │   📋 Sub-tasks: 2/3  |  📅 Không   │  │    │
│  │  │   🏷️ Mua sắm     [✏️] [🗑️]        │  │    │
│  │  └─────────────────────────────────────┘  │    │
│  │                                            │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  [📥 Nhập JSON]  [📤 Xuất JSON]                   │
│                                                    │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Kế Hoạch Triển Khai (Theo Giai Đoạn)

### Giai đoạn 0 - Chuẩn bị Database
- [ ] Tạo tài khoản MongoDB Atlas (miễn phí)
- [ ] Tạo cluster và database
- [ ] Lấy connection string
- [ ] Cấu hình network access & database user

### Giai đoạn 1 - Nền tảng (Ưu tiên cao)
- [ ] Khởi tạo dự án Nuxt 3 + cài đặt dependencies
- [ ] Cấu hình Nuxt UI + Tailwind CSS + Pinia
- [ ] Cài đặt Mongoose + Zod
- [ ] Định nghĩa TypeScript types (`types/todo.ts`)
- [ ] Tạo Mongoose Schema & Model (`server/models/Todo.ts`)
- [ ] Tạo Mongoose Schema & Model (`server/models/Category.ts`)
- [ ] Thiết lập MongoDB connection (`server/utils/mongoose.ts`)
- [ ] Tạo Pinia stores (`stores/todo.ts`, `stores/category.ts`)
- [ ] Tạo composables (`useTodos.ts`, `useCategories.ts`, `useNotifications.ts`)

### Giai đoạn 2 - Backend API
- [ ] API Route: GET `/api/todos` - Lấy danh sách
- [ ] API Route: POST `/api/todos` - Tạo mới
- [ ] API Route: GET `/api/todos/:id` - Lấy 1 todo
- [ ] API Route: PUT `/api/todos/:id` - Cập nhật
- [ ] API Route: DELETE `/api/todos/:id` - Xóa
- [ ] API Route: GET `/api/todos/upcoming` - Tasks sắp hết hạn
- [ ] API Routes: Categories CRUD (`/api/categories`)
- [ ] Validation với Zod
- [ ] Error handling

### Giai đoạn 3 - Categories Management
- [ ] Seed categories mặc định (Công việc, Cá nhân, Học tập, Mua sắm)
- [ ] Component `CategoryManager.vue` - Quản lý categories
- [ ] CRUD categories: Tạo, sửa, xóa
- [ ] Color picker cho category
- [ ] Icon selector cho category
- [ ] Hiển thị số lượng tasks theo category

### Giai đoạn 4 - Frontend CRUD
- [ ] Component `TodoForm.vue` - Form tạo/sửa task (với category selector)
- [ ] Component `TodoItem.vue` - Hiển thị 1 task
- [ ] Component `TodoList.vue` - Danh sách tasks
- [ ] Tích hợp API calls trong composable
- [ ] Chức năng tạo, sửa, xóa, đánh dấu hoàn thành
- [ ] Thêm yêu cầu (requirements) cho task
- [ ] Loading states & error handling

### Giai đoạn 5 - Browser Notifications
- [ ] Component `NotificationManager.vue`
- [ ] Request notification permission
- [ ] Composable `useNotifications.ts` - Logic thông báo
- [ ] Check deadline periodically (mỗi 15 phút)
- [ ] Thông báo 1 ngày trước deadline
- [ ] Thông báo 3 giờ trước deadline
- [ ] Thông báo 1 giờ trước deadline
- [ ] Thông báo tasks quá hạn
- [ ] Settings: Bật/tắt thông báo
- [ ] Settings: Chọn thời gian cảnh báo

### Giai đoạn 6 - Chức năng nâng cao
- [ ] Sub-tasks (checklist con)
- [ ] Mức độ ưu tiên + màu sắc
- [ ] Hạn hoàn thành (deadline) + datetime picker
- [ ] Offline mode với Local Storage (sync khi online)
- [ ] Background sync cho notifications

### Giai đoạn 7 - Tìm kiếm & Lọc
- [ ] Component `TodoFilters.vue`
- [ ] Tìm kiếm theo tiêu đề/mô tả (client-side & server-side)
- [ ] Lọc theo trạng thái, ưu tiên, category
- [ ] Sắp xếp theo nhiều tiêu chí

### Giai đoạn 8 - Giao diện & UX
- [ ] Component `ThemeToggle.vue` - Dark/Light mode
- [ ] Component `TodoHeader.vue` + `TodoStats.vue`
- [ ] Responsive design
- [ ] Animation & hiệu ứng
- [ ] Toast thông báo
- [ ] Loading skeletons

### Giai đoạn 9 - Hoàn thiện
- [ ] Xuất/Nhập JSON
- [ ] Tối ưu hiệu năng
- [ ] Kiểm tra & sửa lỗi
- [ ] Deploy lên Vercel/Netlify
- [ ] Hoàn thiện README

---

## 🗄️ Thiết Lập MongoDB

### Cách 1: MongoDB Atlas (Cloud - Khuyến nghị)
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Đăng ký tài khoản miễn phí
3. Tạo cluster mới (M0 - Free tier)
4. Tạo database user (username + password)
5. Whitelist IP address (hoặc `0.0.0.0/0` cho development)
6. Lấy connection string: `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/todoapp`
7. Thêm vào file `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/todoapp
   ```

### Cách 2: MongoDB Local
1. Cài đặt MongoDB Community Server
2. Chạy `mongod` để khởi động server
3. Connection string: `mongodb://localhost:27017/todoapp`
4. Thêm vào `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/todoapp
   ```

### Mongoose Schema Example
```typescript
// server/models/Todo.ts
import mongoose from 'mongoose'

const SubTaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
})

const RequirementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true }
})

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  requirements: [RequirementSchema],
  subTasks: [SubTaskSchema],
  completed: { type: Boolean, default: false },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium' 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  deadline: { type: Date, default: null },
  notificationSent: { type: Boolean, default: false },
  notifiedAt: { type: Date, default: null }
}, { 
  timestamps: true  // tự động tạo createdAt & updatedAt
})

export const Todo = mongoose.model('Todo', TodoSchema)
```

### Category Schema
```typescript
// server/models/Category.ts
import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true, default: '#3B82F6' },
  icon: { type: String, required: true, default: 'mdi:folder' },
  order: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false }
}, { 
  timestamps: true
})

export const Category = mongoose.model('Category', CategorySchema)
```

### Default Categories Seeder
```typescript
// server/utils/seedCategories.ts
import { Category } from '../models/Category'

export const defaultCategories = [
  { name: 'Công việc', color: '#3B82F6', icon: 'mdi:briefcase', order: 1, isDefault: true },
  { name: 'Cá nhân', color: '#8B5CF6', icon: 'mdi:account', order: 2, isDefault: true },
  { name: 'Học tập', color: '#10B981', icon: 'mdi:school', order: 3, isDefault: true },
  { name: 'Mua sắm', color: '#F59E0B', icon: 'mdi:cart', order: 4, isDefault: true },
]

export async function seedCategories() {
  const count = await Category.countDocuments()
  if (count === 0) {
    await Category.insertMany(defaultCategories)
    console.log('✅ Seeded default categories')
  }
}
```

---

## 🔔 Hệ Thống Thông Báo

### Browser Notifications Flow

```typescript
// composables/useNotifications.ts
import { useNotification } from '@vueuse/core'

export const useNotifications = () => {
  const isSupported = 'Notification' in window
  const permission = ref(Notification.permission)
  
  // Request permission
  const requestPermission = async () => {
    if (isSupported) {
      permission.value = await Notification.requestPermission()
    }
  }
  
  // Send notification
  const notify = (title: string, options?: NotificationOptions) => {
    if (permission.value === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
    }
  }
  
  // Check upcoming deadlines
  const checkDeadlines = async () => {
    const response = await $fetch('/api/todos/upcoming')
    const todos = response.data
    
    todos.forEach(todo => {
      const deadline = new Date(todo.deadline)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()
      const hours = diff / (1000 * 60 * 60)
      
      // 1 day before (24 hours)
      if (hours <= 24 && hours > 23 && !todo.notificationSent) {
        notify(`Deadline sắp tới: ${todo.title}`, {
          body: `Còn 1 ngày để hoàn thành task này`,
          tag: `todo-${todo._id}-1day`
        })
      }
      
      // 3 hours before
      if (hours <= 3 && hours > 2.5 && !todo.notificationSent) {
        notify(`⚠️ Cảnh báo: ${todo.title}`, {
          body: `Còn 3 giờ đến deadline!`,
          tag: `todo-${todo._id}-3hours`
        })
      }
      
      // 1 hour before
      if (hours <= 1 && hours > 0.5 && !todo.notificationSent) {
        notify(`🚨 Khẩn cấp: ${todo.title}`, {
          body: `Chỉ còn 1 giờ!`,
          tag: `todo-${todo._id}-1hour`
        })
      }
      
      // Overdue
      if (hours < 0 && !todo.completed) {
        notify(`❌ Quá hạn: ${todo.title}`, {
          body: `Task này đã quá deadline`,
          tag: `todo-${todo._id}-overdue`
        })
      }
    })
  }
  
  // Check every 15 minutes
  let interval: NodeJS.Timeout | null = null
  
  const startMonitoring = () => {
    if (interval) return
    checkDeadlines() // Check immediately
    interval = setInterval(checkDeadlines, 15 * 60 * 1000) // 15 minutes
  }
  
  const stopMonitoring = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }
  
  return {
    isSupported,
    permission,
    requestPermission,
    notify,
    checkDeadlines,
    startMonitoring,
    stopMonitoring
  }
}
```

### API Endpoint cho Upcoming Tasks

```typescript
// server/api/todos/upcoming.get.ts
import { Todo } from '~/server/models/Todo'

export default defineEventHandler(async (event) => {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    // Lấy tasks có deadline trong 24h tới hoặc đã quá hạn
    const todos = await Todo.find({
      completed: false,
      deadline: { $lte: tomorrow },
    }).populate('categoryId').sort({ deadline: 1 })
    
    return { success: true, data: todos }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
```

---

## 🎨 Category UI Components

### CategoryManager.vue - Giao diện quản lý

```
┌─────────────────────────────────────────────┐
│  🏷️ Quản Lý Danh Mục               [+ Thêm] │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 💼 Công việc        🔵  [8 tasks]    │   │
│  │                          [✏️] [🗑️]    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 👤 Cá nhân          🟣  [3 tasks]    │   │
│  │                          [✏️] [🗑️]    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 🎓 Học tập          🟢  [5 tasks]    │   │
│  │                          [✏️] [🗑️]    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [+ Thêm Danh Mục Mới]                      │
│                                              │
└─────────────────────────────────────────────┘

Modal Tạo/Sửa Category:
┌─────────────────────────────────────────────┐
│  ✏️ Tạo Danh Mục Mới                  [×]   │
├─────────────────────────────────────────────┤
│                                              │
│  Tên danh mục:                              │
│  [_________________________________]        │
│                                              │
│  Màu sắc:                                   │
│  [🎨 Color Picker] #3B82F6                  │
│  🔴 🟠 🟡 🟢 🔵 🟣 🟤 ⚫ ⚪                    │
│                                              │
│  Icon:                                      │
│  [🔍 Tìm icon...]                           │
│  📁 📂 💼 🎯 🏠 🎓 🛒 ❤️ ⭐ 🔥              │
│                                              │
│  Preview:                                   │
│  ┌──────────────────────┐                  │
│  │ 📁 Danh mục mới  🔵 │                  │
│  └──────────────────────┘                  │
│                                              │
│              [Hủy]  [Lưu]                   │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🎨 Thiết Kế UI/UX Chi Tiết

### 🖼️ Design Style

**Phong cách:** Minimalist, Clean, Modern

- ✨ **Glassmorphism** cho các panel chính (backdrop-blur + semi-transparent)
- 🧊 **Soft UI / Neumorphism nhẹ** cho buttons và cards
- 🌬️ **Whitespace** rộng rãi, thoáng đãng
- 📐 **Rounded corners** (border-radius 12-16px)
- 🎭 **Subtle shadows** (soft, layered)

### 🎨 Color Palette

**Option 1: Pastel + Indigo Accent**
```css
/* Light Mode */
--bg-primary: #FAFAFA          /* Off-white background */
--bg-secondary: #F5F5F5        /* Subtle gray */
--bg-card: rgba(255,255,255,0.7) /* Glass effect with blur */
--accent: #6366F1              /* Indigo accent */
--accent-light: #818CF8        /* Lighter indigo */
--text-primary: #1F2937        /* Near black */
--text-secondary: #6B7280      /* Gray */
--text-muted: #9CA3AF          /* Light gray */

/* Pastel Priority Colors */
--priority-high: #FCA5A5       /* Soft red */
--priority-medium: #FCD34D     /* Soft yellow */
--priority-low: #86EFAC        /* Soft green */

/* Dark Mode */
--bg-primary: #0F172A          /* Slate 900 */
--bg-secondary: #1E293B        /* Slate 800 */
--bg-card: rgba(30,41,59,0.7)  /* Glass effect with blur */
--accent: #818CF8              /* Brighter indigo */
--accent-light: #A5B4FC        /* Even lighter */
--text-primary: #F8FAFC        /* Near white */
--text-secondary: #CBD5E1      /* Light gray */
--text-muted: #64748B          /* Slate gray */
```

**Option 2: Monochrome Zinc + Violet Accent**
```css
/* Light Mode */
--bg-primary: #FAFAFA          /* Zinc 50 */
--bg-secondary: #F4F4F5        /* Zinc 100 */
--bg-card: rgba(255,255,255,0.8)
--accent: #8B5CF6              /* Violet */
--accent-light: #A78BFA        /* Light violet */

/* Dark Mode */
--bg-primary: #18181B          /* Zinc 900 */
--bg-secondary: #27272A        /* Zinc 800 */
--bg-card: rgba(39,39,42,0.8)
--accent: #A78BFA              /* Brighter violet */
```

### 🔤 Typography

**Font Family:** `Inter` hoặc `Geist Sans`

```css
/* Font Scale */
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;

/* Sizes */
--text-xs: 0.75rem     /* 12px - Labels */
--text-sm: 0.875rem    /* 14px - Secondary text */
--text-base: 1rem      /* 16px - Body */
--text-lg: 1.125rem    /* 18px - Card titles */
--text-xl: 1.25rem     /* 20px - Section headings */
--text-2xl: 1.5rem     /* 24px - Page title */

/* Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### ⚡ Micro-interactions (VueUse Motion)

#### 1. **Thêm Task Mới**
```typescript
// TodoList.vue - Task slide in from bottom
const taskEnter = {
  initial: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  enter: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
}
```

#### 2. **Hoàn Thành Task**
```typescript
// TodoItem.vue - Strikethrough + fade + bounce checkmark
const completeTask = {
  // Text strikethrough smooth
  textDecoration: 'line-through',
  transition: 'text-decoration 0.3s ease-in-out',
  
  // Fade out
  opacity: 0.5,
  
  // Checkmark bounce
  checkmark: {
    scale: [1, 1.3, 1],
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15
    }
  }
}
```

#### 3. **Xóa Task**
```typescript
// TodoItem.vue - Slide out + fade
const taskExit = {
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }
}

// Auto re-layout
<TransitionGroup name="list" tag="div">
  <TodoItem v-for="task in tasks" :key="task.id" />
</TransitionGroup>

/* CSS */
.list-move {
  transition: transform 0.3s ease;
}
```

#### 4. **Hover Effects**
```css
/* Card hover */
.todo-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.2);
}

/* Button hover */
.btn-primary {
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px -4px var(--accent);
}
```

### 🎯 Visual Feedback

#### Progress Bar / Circle
```vue
<!-- TodoStats.vue -->
<div class="stats-card">
  <!-- Circular Progress -->
  <svg class="progress-ring" width="120" height="120">
    <circle
      class="progress-ring-circle"
      :stroke-dasharray="`${progress} ${circumference - progress}`"
      :style="{ 
        transition: 'stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'rotate(-90deg)',
        transformOrigin: 'center'
      }"
    />
  </svg>
  
  <div class="progress-text">
    <span class="percentage">{{ completionRate }}%</span>
    <span class="label">Hoàn thành</span>
  </div>
</div>

<!-- Linear Progress Bar -->
<div class="progress-bar">
  <div 
    class="progress-fill"
    :style="{ width: `${completionRate}%` }"
  />
</div>
```

#### Task Count Badges
```vue
<div class="stats-grid">
  <div class="stat-item">
    <span class="stat-icon">📊</span>
    <span class="stat-value">{{ totalTasks }}</span>
    <span class="stat-label">Tổng</span>
  </div>
  <div class="stat-item accent">
    <span class="stat-icon">✅</span>
    <span class="stat-value">{{ completedTasks }}</span>
    <span class="stat-label">Xong</span>
  </div>
  <div class="stat-item">
    <span class="stat-icon">📝</span>
    <span class="stat-value">{{ activeTasks }}</span>
    <span class="stat-label">Còn lại</span>
  </div>
  <div class="stat-item warning">
    <span class="stat-icon">⚠️</span>
    <span class="stat-value">{{ overdueTasks }}</span>
    <span class="stat-label">Quá hạn</span>
  </div>
</div>
```

### 🔄 Filtering & Sorting với Animated Tabs

```vue
<!-- TodoFilters.vue -->
<div class="tab-group">
  <div class="tab-slider" :style="sliderStyle" />
  
  <button
    v-for="tab in tabs"
    :key="tab.value"
    :class="['tab', { active: activeTab === tab.value }]"
    @click="setActiveTab(tab.value)"
  >
    {{ tab.label }}
  </button>
</div>

<script setup>
const tabs = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang làm' },
  { value: 'completed', label: 'Hoàn thành' }
]

const sliderStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * 100}%)`,
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}))
</script>

<style>
.tab-group {
  position: relative;
  display: flex;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 4px;
}

.tab-slider {
  position: absolute;
  height: calc(100% - 8px);
  width: calc(33.33% - 8px);
  background: var(--accent);
  border-radius: 8px;
  z-index: 0;
}

.tab {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 8px 16px;
  transition: color 0.2s ease;
}

.tab.active {
  color: white;
}
</style>
```

### 💬 Input Bar Nổi Bật

```vue
<!-- TodoForm.vue -->
<div class="input-wrapper">
  <div class="input-container">
    <input
      v-model="newTask"
      placeholder="Thêm công việc mới..."
      class="task-input"
      @keyup.enter="addTask"
    />
    <button class="add-btn" @click="addTask">
      <Icon name="mdi:plus" />
    </button>
  </div>
</div>

<style>
.input-wrapper {
  position: sticky;
  top: 80px;
  z-index: 10;
  padding: 16px 0;
  background: linear-gradient(
    to bottom,
    var(--bg-primary) 0%,
    var(--bg-primary) 80%,
    transparent 100%
  );
}

.input-container {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border: 2px solid var(--accent);
  border-radius: 16px;
  display: flex;
  padding: 4px;
  box-shadow: 
    0 8px 24px -8px rgba(99, 102, 241, 0.3),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

.input-container:focus-within {
  box-shadow: 
    0 12px 32px -8px rgba(99, 102, 241, 0.4),
    0 0 0 3px rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.task-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 16px;
  font-size: 1rem;
  outline: none;
}

.add-btn {
  background: var(--accent);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--accent-light);
  transform: scale(1.05);
}
</style>
```

### 🎭 Empty States

```vue
<!-- TodoList.vue -->
<div v-if="filteredTasks.length === 0" class="empty-state">
  <div class="empty-illustration">
    <!-- SVG illustration hoặc Lottie animation -->
    <img src="/illustrations/empty-tasks.svg" alt="No tasks" />
  </div>
  
  <h3 class="empty-title">{{ emptyStateTitle }}</h3>
  <p class="empty-message">{{ emptyStateMessage }}</p>
  
  <div class="empty-quote" v-if="filter === 'all'">
    <Icon name="mdi:format-quote-open" />
    <p class="quote-text">{{ inspirationalQuote }}</p>
    <span class="quote-author">— {{ quoteAuthor }}</span>
  </div>
  
  <button class="cta-button" @click="showAddTaskForm">
    <Icon name="mdi:plus-circle" />
    Tạo công việc đầu tiên
  </button>
</div>

<script setup>
const quotes = [
  { 
    text: "Hành trình nghìn dặm bắt đầu từ một bước chân.", 
    author: "Lão Tử" 
  },
  { 
    text: "Điều duy nhất để hoàn thành công việc là bắt đầu.", 
    author: "Unknown" 
  },
  { 
    text: "Một mục tiêu không có kế hoạch chỉ là một ước mơ.", 
    author: "Antoine de Saint-Exupéry" 
  }
]

const randomQuote = computed(() => 
  quotes[Math.floor(Math.random() * quotes.length)]
)
</script>

<style>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-illustration {
  width: 240px;
  height: 240px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-message {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.empty-quote {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  max-width: 500px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.quote-text {
  font-size: 1.125rem;
  font-style: italic;
  color: var(--text-primary);
  margin: 12px 0;
}

.quote-author {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.cta-button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -6px var(--accent);
}
</style>
```

### 🪟 Glassmorphism Cards

```css
/* TodoItem.vue */
.todo-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 
    0 8px 32px -8px rgba(31, 38, 135, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode */
.dark .todo-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px -8px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### 🎨 Soft UI / Neumorphism

```css
/* Buttons với Soft UI */
.btn-soft {
  background: var(--bg-primary);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.3),
    -8px -8px 16px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.btn-soft:hover {
  box-shadow: 
    4px 4px 8px rgba(163, 177, 198, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
}

.btn-soft:active {
  box-shadow: 
    inset 4px 4px 8px rgba(163, 177, 198, 0.3),
    inset -4px -4px 8px rgba(255, 255, 255, 0.8);
}

/* Dark mode */
.dark .btn-soft {
  background: var(--bg-secondary);
  box-shadow: 
    8px 8px 16px rgba(0, 0, 0, 0.4),
    -8px -8px 16px rgba(255, 255, 255, 0.05);
}
```

---

## 🎨 Bảng Màu Gợi Ý (Cũ - Tham khảo)

| Thành phần         | Light Mode  | Dark Mode   |
| ------------------- | ----------- | ----------- |
| Background          | `#F9FAFB`   | `#111827`   |
| Card Background     | `#FFFFFF`   | `#1F2937`   |
| Primary             | `#3B82F6`   | `#60A5FA`   |
| Ưu tiên Cao         | `#EF4444`   | `#F87171`   |
| Ưu tiên Trung bình  | `#F59E0B`   | `#FBBF24`   |
| Ưu tiên Thấp        | `#10B981`   | `#34D399`   |
| Text Primary        | `#111827`   | `#F9FAFB`   |
| Text Secondary      | `#6B7280`   | `#9CA3AF`   |

> **Lưu ý:** Sử dụng palette mới ở phần **Thiết Kế UI/UX Chi Tiết** phía trên (Pastel + Indigo hoặc Monochrome + Violet)

---

## 📝 Ghi Chú

- Backend API sử dụng **Nuxt Server Routes** (full-stack framework)
- Database: **MongoDB Atlas** (miễn phí 512MB)
- Dữ liệu lưu trên cloud, truy cập từ mọi thiết bị
- **Offline mode:** Đồng bộ với Local Storage khi mất kết nối
- **Browser Notifications:** Cảnh báo deadline tự động (1 ngày, 3 giờ, 1 giờ trước)
- **Custom Categories:** Tạo danh mục riêng với màu sắc & icon tùy chỉnh
- **Background monitoring:** Check deadline mỗi 15 phút
- Có thể deploy lên **Vercel** hoặc **Netlify** miễn phí
- Mongoose cung cấp schema validation & type safety
- API được bảo vệ bằng validation middleware (Zod)

---

## 🔐 Bảo Mật & Best Practices

- ✅ Validation input với Zod
- ✅ Environment variables cho sensitive data
- ✅ Error handling toàn diện
- ✅ TypeScript cho type safety
- ✅ Mongoose schema validation
- ✅ Request notification permission (user consent)
- ✅ Graceful degradation (notifications không support)
- 🔜 Rate limiting (nếu cần)
- 🔜 Authentication (JWT) - phase 2 nếu cần

---

## 🎯 Tổng Kết Chức Năng Mới

### 🔔 Thông Báo Browser
- ✅ Yêu cầu permission khi vào app
- ✅ Tự động check deadline mỗi 15 phút
- ✅ Cảnh báo 3 mức: 1 ngày, 3 giờ, 1 giờ trước deadline
- ✅ Thông báo tasks quá hạn
- ✅ Settings tùy chỉnh (bật/tắt, chọn thời gian)
- ✅ In-app toast notifications
- ⚡ Background monitoring kể cả khi tab không active

### 🏷️ Quản Lý Categories
- ✅ CRUD đầy đủ (Tạo, Sửa, Xóa, Xem)
- ✅ 4 categories mặc định (không xóa được)
- ✅ Tạo categories tùy chỉnh không giới hạn
- ✅ Chọn màu sắc (color picker)
- ✅ Chọn icon từ Iconify (1000+ icons)
- ✅ Hiển thị số lượng tasks theo category
- ✅ Khi xóa category, tasks chuyển sang "Khác"
- ⚡ Drag & drop sắp xếp thứ tự (phase 2)

---

> 💡 **Bước tiếp theo:** Xác nhận kế hoạch → Thiết lập MongoDB Atlas → Bắt đầu triển khai từ Giai đoạn 0
