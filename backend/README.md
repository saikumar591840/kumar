# Backend Deployment to Vercel

## Environment Variables Required

Set these environment variables in your Vercel project settings:

- `MONGO_URI`: Your MongoDB connection string (Atlas recommended)
- `JWT_SECRET`: A secure random string for JWT token signing
- `NODE_ENV`: Set to `production`

## MongoDB Atlas Setup

1. **IP Whitelist**: Add `0.0.0.0/0` to allow all IPs (for Vercel deployment)
2. **Database User**: Ensure your connection string uses correct credentials
3. **Network Access**: Make sure MongoDB Atlas allows connections from anywhere

## Deployment Steps

1. Push this backend code to a GitHub repository
2. Connect your GitHub repo to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy

## Troubleshooting Database Connection

If you see database connection errors:

1. **Check Environment Variables**: Ensure `MONGO_URI` is set correctly in Vercel
2. **MongoDB Atlas Network Access**: Allow access from `0.0.0.0/0`
3. **Connection String Format**: Use the format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database_name
   ```
4. **Check Vercel Logs**: Look for detailed error messages in Vercel function logs

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