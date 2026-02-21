# InsideOut Expressions - Backend Structure

## Architecture: Modular by Feature

```
src/
├── modules/                    # Feature modules
│   ├── auth/                   # Registration (with consent), login, refresh tokens
│   ├── users/                  # Profile management, roles (student/professional)
│   ├── diary/                  # CRUD personal diary entries
│   ├── emotions/               # Emotion wheel + AI integration
│   ├── chat/                   # Real-time chat with Socket.io
│   └── notifications/          # In-app notifications (real-time via Socket.io)
├── shared/
│   ├── config/                 # Environment variables validated with Zod
│   ├── middleware/              # Auth (JWT), error handler, Zod validation
│   ├── errors/                 # Custom error classes (AppError)
│   └── utils/                  # Helpers (asyncHandler)
├── infrastructure/
│   ├── database/               # Prisma client singleton
│   ├── ai/                     # Abstract AI provider (OpenAI/Anthropic)
│   └── websocket/              # Socket.io setup with JWT auth
├── app.ts                      # Express app configuration
└── server.ts                   # Entry point (HTTP + WebSocket)
```

## Module Pattern

Each module follows: `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.repository.ts`

Validation schemas in `*.validation.ts` using Zod.

## API Endpoints

| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| POST   | /api/auth/register                | No   | Register with consent    |
| POST   | /api/auth/login                   | No   | Login, get tokens        |
| POST   | /api/auth/refresh                 | No   | Refresh access token     |
| GET    | /api/users/profile                | Yes  | Get own profile          |
| PATCH  | /api/users/profile                | Yes  | Update own profile       |
| GET    | /api/diary                        | Yes  | List diary entries       |
| GET    | /api/diary/:id                    | Yes  | Get single entry         |
| POST   | /api/diary                        | Yes  | Create entry             |
| PATCH  | /api/diary/:id                    | Yes  | Update entry             |
| DELETE | /api/diary/:id                    | Yes  | Delete entry             |
| GET    | /api/emotions/wheel               | No   | Get emotion wheel        |
| POST   | /api/emotions/log                 | Yes  | Log emotion + AI feedback|
| GET    | /api/emotions/history             | Yes  | Emotion log history      |
| POST   | /api/chat/rooms                   | Yes  | Create chat room         |
| GET    | /api/chat/rooms                   | Yes  | List user's rooms        |
| GET    | /api/chat/rooms/:roomId/messages  | Yes  | Get room messages        |
| POST   | /api/chat/rooms/:roomId/messages  | Yes  | Send message             |
| GET    | /api/notifications                | Yes  | List notifications       |
| PATCH  | /api/notifications/:id/read       | Yes  | Mark as read             |
| PATCH  | /api/notifications/read-all       | Yes  | Mark all as read         |

## Quick Start

```bash
cp .env.example .env
docker-compose up
```
