# Google Authentication Setup Guide
*For CVPHOTO App - Simple 4-Step Setup*

## Prerequisites
- Google account
- Access to your Supabase project dashboard
- Code already running locally (`npm run dev`)

---

## Step 1: Google Cloud Console Setup (10 minutes)

### 1.1 Create a Google Project
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click the project dropdown at the top → **"New Project"**
4. Name it: `Your-App-Name` → Click **"Create"**
5. Wait for it to create, then select your new project

### 1.2 Set Up OAuth Consent Screen
1. In the left menu: **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** → Click **"Create"**
3. Fill in **required fields only**:
   - **App name**: Your app name
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"** through all 4 steps (leave everything else default)

### 1.3 Create OAuth Credentials
1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Name it: `Your-App-Web-Client`

### 1.4 Configure URLs
**Important**: Replace `YOUR-SUPABASE-PROJECT-ID` with your actual Supabase project ID

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://YOUR-SUPABASE-PROJECT-ID.supabase.co/auth/v1/callback
```

5. Click **"Create"**
6. **📋 COPY AND SAVE**: Client ID and Client Secret (you'll need these next!)

---

## Step 2: Supabase Configuration (5 minutes)

### 2.1 Enable Google Provider
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Authentication** → **Providers**
4. Find **"Google"** → Toggle it **ON**
5. Paste your Google credentials:
   - **Client ID**: (from Step 1)
   - **Client Secret**: (from Step 1)
6. Click **"Save"**

### 2.2 Configure URL Settings
1. Still in **Authentication**, go to: **URL Configuration**
2. **Update Site URL**:
   - Change from `http://localhost:3000` to your production domain
   - For development: keep `http://localhost:3000`
   - For production: use `https://yourdomain.com`
3. **Add Redirect URLs**:
   - Click **"Add URL"**
   - Add: `http://localhost:3000` (for local development)
   - Click **"Add URL"** again  
   - Add: `https://yourdomain.com` (for production)
4. Click **"Save changes"**

**⚠️ Important**: Without these URL configurations, Google auth will fail in production!

---

## Step 3: Environment Variables (2 minutes)

### 3.1 Find Your Supabase Project ID
- In Supabase dashboard, look at your URL: `https://supabase.com/dashboard/project/YOUR-PROJECT-ID`
- Copy the project ID from the URL

### 3.2 Update .env.local File
Add this line to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production**, change it to:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Step 4: Test Everything (2 minutes)

### 4.1 Test the Flow
1. Make sure your app is running: `npm run dev`
2. Go to: `http://localhost:3000/auth`
3. Click **"Continue with Google"**
4. You should see Google's permission screen
5. Grant permission → You should be redirected back to your app

### 4.2 Expected Behavior
- **First time**: Google → Your app's signup/onboarding flow
- **Return visits**: Google → Straight to dashboard

---

## 🚨 Common Issues & Fixes

### "redirect_uri_mismatch" Error
- **Problem**: URLs don't match exactly
- **Fix**: Double-check your redirect URI in Google Console matches exactly:
  ```
  https://YOUR-SUPABASE-PROJECT-ID.supabase.co/auth/v1/callback
  ```

### Google Button Does Nothing
- **Problem**: Missing `NEXT_PUBLIC_SITE_URL` 
- **Fix**: Add the environment variable from Step 3.2

### "OAuth Error" Messages
- **Problem**: Google provider not enabled in Supabase
- **Fix**: Complete Step 2 - enable Google in Supabase and add your credentials

---

## 📋 Quick Checklist

Before going live, make sure you have:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured  
- [ ] OAuth credentials created with correct redirect URI
- [ ] Google provider enabled in Supabase
- [ ] Client ID & Secret added to Supabase
- [ ] `NEXT_PUBLIC_SITE_URL` in your `.env.local`
- [ ] Tested the complete Google sign-in flow

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Google Console**:
   - Add your production domain to "Authorized JavaScript origins"
   - Keep the same Supabase redirect URI (it doesn't change)

2. **Update Supabase URL Configuration**:
   - Go to: **Authentication** → **URL Configuration**
   - Change **Site URL** from `http://localhost:3000` to `https://yourdomain.com`
   - Ensure your production domain is in the **Redirect URLs** list

3. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

4. **Test production**: Make sure Google auth works on your live site

---

*That's it! Your Google authentication should now work perfectly. Users can sign in/up with one click, and new users will go through your app's onboarding flow automatically.* 