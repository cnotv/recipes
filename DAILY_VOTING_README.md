# Daily Recipe Voting System

This is a real-time voting system where users can create sessions to vote on which recipe to cook for the day. It uses serverless functions and WebSocket connections for real-time updates.

## Features

- **Create Voting Sessions**: Start a new session with 2+ recipes
- **Join with Session Code**: Others can join using a 6-character code
- **Real-time Voting**: Live updates when users vote
- **Session Management**: 24-hour expiration, user tracking
- **Multilingual**: English, German, Japanese, Thai support

## Architecture

### Frontend (Vue 3 + TypeScript)
- **DailyVote.vue**: Main voting interface
- **useDailyVoting.ts**: WebSocket and API integration
- **Multilingual i18n**: Complete translation support

### Backend (Serverless Functions)
- **create-session.js**: Creates new voting sessions
- **join-session.js**: Allows users to join existing sessions  
- **vote.js**: Handles voting logic and real-time updates

### Real-time Communication
- WebSocket connections for live updates
- Session state synchronization
- User presence tracking

## Deployment Options

### Option 1: Netlify Functions + Pusher
```bash
# 1. Deploy to Netlify
npm run build
netlify deploy --prod

# 2. Set environment variables
VITE_API_BASE_URL=https://your-site.netlify.app/.netlify/functions
VITE_WEBSOCKET_URL=wss://pusher-app-key.pusher.com
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
```

### Option 2: Vercel + Ably
```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Set environment variables
VITE_API_BASE_URL=https://your-project.vercel.app/api
VITE_WEBSOCKET_URL=wss://realtime-client.ably.io
ABLY_API_KEY=your-api-key
```

### Option 3: Supabase (Recommended)
```bash
# 1. Create Supabase project
# 2. Set up database tables:

-- Voting sessions table
CREATE TABLE voting_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  recipes JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_by TEXT NOT NULL,
  users JSONB DEFAULT '[]'::jsonb
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE voting_sessions;

# 3. Set environment variables
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
VITE_WEBSOCKET_URL=wss://your-project.supabase.co/realtime/v1
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## Database Schema

### voting_sessions
```json
{
  "id": "session_1694448000000_abc123",
  "name": "Family Dinner Vote",
  "code": "ABC123",
  "recipes": [
    {
      "url": "recipe-url",
      "title": "Recipe Title",
      "cuisine": "Italian",
      "votes": 3
    }
  ],
  "created_at": 1694448000000,
  "expires_at": 1694534400000,
  "created_by": "user_123",
  "users": [
    {
      "id": "user_123",
      "name": "Alice",
      "hasVoted": true,
      "votedFor": "recipe-url"
    }
  ]
}
```

## WebSocket Events

### Client → Server
```json
{
  "type": "join",
  "sessionCode": "ABC123",
  "userId": "user_123"
}

{
  "type": "vote",
  "sessionCode": "ABC123",
  "recipeUrl": "recipe-url",
  "userId": "user_123"
}

{
  "type": "leave",
  "sessionCode": "ABC123", 
  "userId": "user_123"
}
```

### Server → Client
```json
{
  "type": "session_update",
  "session": { /* session object */ },
  "users": [ /* connected users */ ]
}
```

## Development

```bash
# Start development server
npm run dev

# Visit daily voting page
http://localhost:5173/daily-vote

# Test with multiple browser windows/tabs
# Create session in one, join with code in another
```

## Production Considerations

1. **Database**: Use PostgreSQL (Supabase), MongoDB, or Firebase
2. **Real-time**: Pusher, Ably, or Supabase Realtime 
3. **Caching**: Redis for session data
4. **Rate Limiting**: Prevent spam voting
5. **Authentication**: Optional user accounts
6. **Moderation**: Content filtering for session names
7. **Analytics**: Track voting patterns

## Security

- Session codes expire after 24 hours
- Rate limiting on API endpoints  
- Input validation and sanitization
- CORS configuration
- User session verification

## Scaling

- Horizontal scaling with serverless functions
- Database connection pooling
- CDN for static assets
- WebSocket connection limits
- Session cleanup jobs

This system provides a complete real-time voting experience for deciding what to cook together! 🍽️✨
