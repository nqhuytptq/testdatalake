# 🚀 Hướng dẫn Setup IoT Data Platform

## 📋 Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

## 🛠️ Cài đặt

### Bước 1: Tạo project React + Vite
```bash
npm create vite@latest iot-platform -- --template react-ts
cd iot-platform
```

### Bước 2: Cài đặt Tailwind CSS v4
```bash
npm install -D tailwindcss@next @tailwindcss/vite@next
```

Tạo file `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### Bước 3: Cài đặt dependencies chính
```bash
npm install recharts lucide-react date-fns
```

### Bước 4: Cài đặt Radix UI components
```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip
```

### Bước 5: Cài đặt utilities
```bash
npm install class-variance-authority clsx tailwind-merge sonner vaul cmdk input-otp embla-carousel-react react-day-picker react-resizable-panels
```

## 📁 Cấu trúc thư mục

Tạo cấu trúc thư mục như sau trong folder `src/`:

```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── calendar.tsx
│   │   ├── popover.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── dialog.tsx
│   │   └── alert.tsx
│   ├── DashboardOverview.tsx
│   ├── DeviceManagement.tsx
│   ├── DataQuery.tsx
│   ├── DataVisualization.tsx
│   └── UserManagement.tsx
├── contexts/
│   └── AuthContext.tsx
└── styles/
    └── globals.css
```

## 🎨 Setup CSS

Trong file `src/main.tsx`, import CSS:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 🖼️ Logo PTIT

Download logo PTIT và đặt vào thư mục `public/ptit-logo.png`, sau đó thay thế:
```typescript
// Thay vì:
import ptitLogo from 'figma:asset/...'

// Dùng:
const ptitLogo = '/ptit-logo.png'
```

## ▶️ Chạy project

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

## 🔑 Tài khoản demo

- **Admin**: admin@ptit.edu.vn / admin123
- **Manager**: manager@ptit.edu.vn / manager123
- **Viewer**: user@ptit.edu.vn / user123

## 📦 Build cho production

```bash
npm run build
```

File build sẽ nằm trong thư mục `dist/`

## 🔧 Troubleshooting

### Lỗi import paths
Nếu gặp lỗi import, đảm bảo bạn đã cấu hình alias trong `vite.config.ts` và tsconfig:

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Lỗi Tailwind classes không hoạt động
Đảm bảo đã import `globals.css` trong `main.tsx` và Tailwind plugin đã được thêm vào `vite.config.ts`

## 🌐 Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload folder dist/ lên Netlify
```

## 📝 Notes

- Project này sử dụng **Tailwind CSS v4** (alpha version)
- Authentication hiện tại dùng LocalStorage (mock data)
- Để production, nên integrate với backend thật (Supabase, Firebase, etc.)
- Logo PTIT cần được download riêng vì không thể export từ Figma Make

## 🤝 Support

Nếu gặp vấn đề, kiểm tra:
1. Node version >= 18
2. Đã cài đủ dependencies
3. File paths import đúng
4. Logo đã được đặt đúng vị trí
