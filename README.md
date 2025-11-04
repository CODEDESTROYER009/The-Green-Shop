<<<<<<< HEAD
# The-Green-Shop
=======
# 🌱 GreenShop - Sustainable E-Commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)

A modern, eco-friendly e-commerce platform built with React, TypeScript, and Supabase. GreenShop promotes sustainable shopping by helping users track their environmental impact and earn rewards for making eco-conscious purchases.

## ✨ Features

- 🛍️ Browse eco-friendly products
- 🌍 Track your environmental impact
- 🏆 Earn green points for sustainable purchases
- 🔍 Advanced product filtering and search
- 🛒 Shopping cart functionality
- 🔐 Secure user authentication
- ⚡ Blazing fast performance with Vite
- 🎨 Beautiful UI built with shadcn/ui
- 📱 Fully responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/greenshop.git
   cd greenshop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
greenshop/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages
│   ├── lib/            # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── assets/         # Static assets
│   ├── integrations/   # Third-party integrations
│   └── App.tsx         # Main application component
├── public/             # Public assets
├── .env.example        # Example environment variables
└── vite.config.ts      # Vite configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Build Tool**: Vite
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Query
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI Primitives
- **Icons**: Lucide React

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tool
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Supabase](https://supabase.com/) for the backend services

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/de954b7a-ea44-49dc-9992-9afdc07b03b7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
>>>>>>> 6ea8a69 (Initial Commit)
