<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,50:1E3A8A,100:38BDF8&height=180&section=header&text=ChapPlus%20Merchant&fontSize=40&fontColor=ffffff&fontAlignY=36&desc=One%20app%20for%20every%20kind%20of%20business&descAlignY=58&descSize=16" alt="ChapPlus Merchant" />

<p><b>📱 Cross-platform Mobile App · iOS & Android</b></p>

<p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" alt="React Hook Form" />
</p>

</div>

## 📖 Overview

**ChapPlus Merchant** is a multi-business merchant app built with **React Native & Expo**. A single app adapts to the merchant's business type — **E-commerce store, Hotel, Restaurant or Bus provider** — giving each one its own dashboard, analytics and management tools.

## ✨ Key Features

### 🏪 Multi-Business Dashboards

- **E-commerce** — products, orders, top-selling products, analytics
- **Hotel** — hotel listings, room bookings, analytics
- **Restaurant** — menu items (add / edit / details), orders
- **Bus provider** — buses, seat bookings, analytics

### 💰 Payments

- Request payouts
- Payout history

### 🔐 Account

- Registration, login, email & OTP verification, password reset
- Profile setup, shipping address, notifications
- Image upload with picker & manipulator
- Persisted session with Redux Persist & AsyncStorage

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React Native 0.86 · Expo SDK 57 |
| **Language** | TypeScript |
| **Navigation** | Expo Router (role-based tab groups) |
| **State** | Redux Toolkit · React Redux · Redux Persist · AsyncStorage |
| **Forms** | React Hook Form |
| **Styling** | twrnc (Tailwind for RN) · Expo Linear Gradient |
| **UI & Media** | Expo Image · Image Picker · Toast Message · Render HTML · Lucide |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Expo Go](https://expo.dev/go) on your phone, or an Android emulator / iOS simulator

### Installation

```bash
git clone https://github.com/moazzembhuiyan/chapplus-merchant-app-react-native-.git
cd chapplus-merchant-app-react-native-
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_URL=
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the backend API |

### Run

```bash
npx expo start
# press a → Android · i → iOS · w → Web, or scan the QR code with Expo Go
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run reset-project` | Reset the Expo starter project |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in the browser |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```text
src/
├── app/
│   ├── (auth)/                     # Login, registration, verification
│   ├── (e-commerce-tab)/           # Store dashboard
│   ├── (hotel-tab)/                # Hotel dashboard
│   ├── (restaurant-provider-tab)/  # Restaurant dashboard
│   ├── (bus-provider-tab)/         # Bus provider dashboard
│   └── ...                         # Details, payouts, profile screens
├── redux/ · store/                 # Global state
└── utils/
components/                         # Shared UI
```

---

<div align="center">

### 👨‍💻 Developed by [Moazzem Hossen Bhuiyan](https://github.com/moazzembhuiyan)

<sub>Mobile App Developer (React Native) • Web Developer</sub>

<p>
  <a href="https://github.com/moazzembhuiyan"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/moazzem-hossen-bhuiyan-325432331/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="mailto:moazzembhuiyan394@gmail.com"><img src="https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

<sub>⭐ If you like this project, consider giving it a star!</sub>

</div>
