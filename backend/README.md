# Backend Deployment to Vercel

## Environment Variables Required

Set these environment variables in your Vercel project settings:

- `MONGO_URI`: Your MongoDB connection string (Atlas recommended)
- `JWT_SECRET`: A secure random string for JWT token signing
- `NODE_ENV`: Set to `production`

## Deployment Steps

1. Push this backend code to a GitHub repository
2. Connect your GitHub repo to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task

## Notes

- MongoDB connection is cached for serverless performance
- CORS is configured for production and development
- Error handling is implemented globally