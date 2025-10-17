# 🛒 EcommerceMobile - Ứng dụng Thương mại Điện tử

Một ứng dụng thương mại điện tử hiện đại được xây dựng với React Native và Expo, sử dụng Gluestack UI để tạo trải nghiệm người dùng mượt mà và đẹp mắt.

## ✨ Tính năng chính



## 🚀 Công nghệ sử dụng

### Frontend Framework
- **React Native** 0.81.4 - Framework phát triển ứng dụng di động
- **Expo** ~54.0.13 - Platform phát triển React Native
- **Expo Router** ~6.0.11 - Hệ thống routing mạnh mẽ

### UI/UX
- **Gluestack UI** - Component library hiện đại
- **NativeWind** - Tailwind CSS cho React Native
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React Native** - Icon library đẹp mắt

### Navigation & Animation
- **React Navigation** - Navigation library
- **React Native Reanimated** - Animation library
- **Legend Motion** - Motion library
- **React Native Gesture Handler** - Gesture handling

### State Management & Data
- **React Aria** - Accessibility primitives
- **React Stately** - State management utilities
- **React Native Worklets** - Background processing

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android)
- Xcode (cho iOS)

### Cài đặt dependencies

```bash
# Clone repository
git clone <repository-url>
cd EcommerceMobile/ecom-store

# Cài đặt dependencies
npm install

## 🏃‍♂️ Chạy ứng dụng

### Development Mode

```bash
# Khởi động development server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên Web
npm run web
```

## 📁 Cấu trúc dự án

```
ecom-store/
├── app/                    # App routes (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── login.tsx          # Login screen
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
│   ├── ui/               # UI components (Gluestack UI)
│   └── ...               # Custom components
├── assets/               # Static assets
│   └── images/           # Images và icons
├── constants/            # App constants
├── hooks/               # Custom React hooks
├── scripts/             # Build scripts
└── ...                  # Config files
```

## 🎨 UI Components

Ứng dụng sử dụng Gluestack UI với các component:

- **Layout**: Box, VStack, HStack, Center, Grid
- **Navigation**: Tabs, Drawer, Modal, Popover
- **Forms**: Input, Select, Checkbox, Radio, Switch
- **Display**: Text, Heading, Image, Avatar, Badge
- **Feedback**: Alert, Toast, Progress, Spinner
- **Interactive**: Button, Pressable, FAB, Slider

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env` trong thư mục root:

```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Tailwind Configuration
File `tailwind.config.js` đã được cấu hình sẵn cho NativeWind.

### TypeScript
Dự án sử dụng TypeScript với cấu hình strict mode.

## 📱 Platform Support

- ✅ **iOS** - Hỗ trợ đầy đủ
- ✅ **Android** - Hỗ trợ đầy đủ  
- ✅ **Web** - Hỗ trợ responsive web
- ✅ **Tablet** - Tối ưu cho iPad


## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing development platform
- [Gluestack UI](https://ui.gluestack.io/) - Beautiful component library
- [React Native](https://reactnative.dev/) - Mobile development framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---
