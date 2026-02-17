# Deployment Guide

This guide will walk you through deploying the PollStream application to production.

## Overview

- **Backend**: Deploy to Render (free tier)
- **Frontend**: Deploy to Vercel (free tier)
- **Database**: MongoDB Atlas (free tier)

## Step 1: MongoDB Atlas Setup (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Create a new project (name it "PollStream")
4. Click "Build a Database"
5. Select "M0 Free" tier
6. Choose your region (closest to your users)
7. Click "Create Cluster"
8. **Database Access**: 
   - Click "Database Access" in left menu
   - Add new database user
   - Username: `polladmin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: Read and write to any database
9. **Network Access**:
   - Click "Network Access" in left menu
   - Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
10. **Get Connection String**:
    - Go to Database → Connect
    - Choose "Connect your application"
    - Copy the connection string
    - Replace `<password>` with your password
    - Example: `mongodb+srv://polladmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/polling-app`

## Step 2: Backend Deployment to Render (10 minutes)

1. **Push code to GitHub**:
```bash
cd polling-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/polling-app.git
git push -u origin main
```

2. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `pollstream-backend`
   - Region: Same as your MongoDB cluster
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

4. **Add Environment Variables**:
   Click "Advanced" → Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://polladmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/polling-app
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://YOUR_APP_NAME.vercel.app
   ```
   (We'll update FRONTEND_URL after deploying frontend)

5. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note your backend URL: `https://pollstream-backend.onrender.com`

6. **Test Backend**:
   - Visit: `https://pollstream-backend.onrender.com/health`
   - You should see: `{"status":"ok",...}`

## Step 3: Frontend Deployment to Vercel (5 minutes)

1. **Create Vercel Account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Click "Deploy"

3. **Add Environment Variables**:
   Before deploying, add these:
   ```
   VITE_API_BASE_URL=https://pollstream-backend.onrender.com
   VITE_SOCKET_URL=https://pollstream-backend.onrender.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Note your URL: `https://YOUR_APP_NAME.vercel.app`

5. **Update Backend FRONTEND_URL**:
   - Go back to Render dashboard
   - Click your backend service
   - Environment → Edit
   - Update `FRONTEND_URL` to your Vercel URL
   - Save changes (backend will redeploy)

## Step 4: Testing (5 minutes)

1. **Visit your frontend**: `https://YOUR_APP_NAME.vercel.app`
2. **Create a test poll**
3. **Open the poll in a new incognito window**
4. **Vote and watch real-time updates**
5. **Try voting again** - should be blocked

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution**: 
- Check `VITE_API_BASE_URL` in Vercel environment variables
- Ensure backend is running on Render
- Check CORS settings in backend `server.js`

### Issue: "Socket connection failed"
**Solution**:
- Verify `VITE_SOCKET_URL` matches backend URL
- Check Render logs for WebSocket errors
- Ensure Socket.io is properly configured

### Issue: "MongoDB connection failed"
**Solution**:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (0.0.0.0/0)
- Confirm database user password is correct

### Issue: "Backend keeps restarting"
**Solution**:
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is valid

### Issue: Real-time updates not working
**Solution**:
- Check browser console for WebSocket errors
- Verify both users are on the same poll
- Check Render logs for socket events

## Monitoring

### Render Dashboard
- View deployment logs
- Monitor service health
- Check error rates

### Vercel Dashboard  
- View deployment status
- Monitor analytics
- Check build logs

### MongoDB Atlas
- Monitor database performance
- View connection statistics
- Check storage usage

## Updating Your Deployment

### Backend Updates
```bash
git add .
git commit -m "Update message"
git push origin main
```
Render will automatically redeploy.

### Frontend Updates
```bash
git add .
git commit -m "Update message"  
git push origin main
```
Vercel will automatically redeploy.

## Cost Estimates

- **MongoDB Atlas**: Free (M0 cluster, 512MB storage)
- **Render**: Free (with 750 hours/month, sleeps after 15 min inactive)
- **Vercel**: Free (100GB bandwidth/month)

**Note**: Free tier backends on Render sleep after 15 minutes of inactivity and take 30-60 seconds to wake up. For production apps with consistent traffic, consider upgrading to paid tiers.

## Production Checklist

Before sharing your app:
- [ ] Test poll creation
- [ ] Test voting from multiple devices
- [ ] Verify real-time updates work
- [ ] Test anti-abuse mechanisms
- [ ] Check mobile responsiveness
- [ ] Test with slow internet connection
- [ ] Verify error handling
- [ ] Test share link functionality
- [ ] Check 404 page
- [ ] Review security headers (Helmet)

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Keep MongoDB credentials secure
3. **CORS**: Only allow your frontend domain in production
4. **Rate Limiting**: Already implemented in backend
5. **Input Validation**: Implemented on both frontend and backend

## Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables
4. Test MongoDB connection
5. Check CORS configuration

## Next Steps

After successful deployment:
1. Share your poll link to test with real users
2. Monitor usage in dashboards
3. Collect feedback
4. Plan feature improvements
5. Consider adding analytics

Your app is now live! 🎉
