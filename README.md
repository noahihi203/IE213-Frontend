IE213 Blog - Next.js Frontend

# Installation

```bash
npm install
```

# Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

# Configuration

Create `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/v1/api
```

# Features

## Authentication

- Login & Register pages with form validation
- JWT token management with automatic refresh
- Protected routes with authentication checks
- User session persistence

## Posts

- Browse all published posts with pagination
- Search posts by title/content
- Filter posts by category
- View post details with markdown rendering
- Like/unlike posts
- Create new posts (for poster/admin roles)
- Edit own posts
- Draft/Publish workflow

## Dashboard

- User profile overview
- Manage user's posts (view, edit, delete)
- View post statistics (views, likes, comments)
- Filter posts by status (draft/published/archived)

## Categories

- Browse all categories
- View posts by category
- Category icons and descriptions

## Features by Role

- **User**: Browse posts, like, comment
- **Poster**: All user features + Create/edit posts
- **Admin**: All features + Manage users, categories

# API Integration

All API services are in `src/lib/api/`:

- `auth.service.ts` - Authentication (login, register, logout)
- `post.service.ts` - Posts CRUD, like/unlike
- `category.service.ts` - Categories management
- `user.service.ts` - User profile & management

# Project Structure

```
src/
├── app/                    # Next.js 14 App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # User dashboard
│   ├── posts/             # Posts list, detail, create
│   └── categories/        # Categories list
├── components/
│   ├── layout/            # Navbar, Footer
│   └── providers/         # AuthProvider
├── lib/
│   ├── api/               # API services
│   └── types/             # TypeScript types
└── store/
    └── authStore.ts       # Zustand auth state management
```

# Testing Backend APIs

1. Start backend server:

```bash
cd Backend-IE213
npm run dev
```

2. Start frontend:

```bash
cd Frontend-IE213
npm run dev
```

3. Test flow:
   - Register new account at `/register`
   - Login at `/login`
   - Browse posts at `/posts`
   - Create post at `/posts/create` (if poster/admin)
   - View post details, like posts
   - Check dashboard at `/dashboard`

# Technologies Used

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State management)
- **Axios** (API requests)
- **React Markdown** (Markdown rendering)
- **lucide-react** (Icons)
- **date-fns** (Date formatting)
