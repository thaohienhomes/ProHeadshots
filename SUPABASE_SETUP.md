# Supabase Setup Guide for CV Photo App

This guide will walk you through setting up Supabase from scratch for the CV Photo application. Follow these steps in order to ensure everything works correctly.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js v20.14.0 or above installed
- Git installed and configured

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Enter a project name (e.g., "cvphoto-app")
6. Enter a strong database password and save it somewhere secure
7. Select a region closest to your users
8. Click "Create new project"
9. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Environment Variables

1. Go to your project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API" under the Project Settings section
4. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)

## Step 3: Install Required Extensions

1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy and paste the following SQL code:

```sql
-- Core Supabase Extensions (REQUIRED)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;

-- GraphQL Support
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA graphql;

-- Security & Encryption
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA pgsodium;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA vault;

-- Job Scheduling (for auto-cleanup)
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA pg_catalog;

-- Core Language
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA pg_catalog;
```

4. Click "Run" to execute the query
5. Verify all extensions were installed successfully

## Step 4: Create the User Table

1. In the SQL Editor, create a new query
2. Copy and paste the following SQL code:

```sql
CREATE TABLE public."userTable" (
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "email" TEXT,
    "id" TEXT PRIMARY KEY,
    "paymentStatus" TEXT,
    "amount" NUMERIC,
    "planType" TEXT,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "name" TEXT,
    "height" TEXT,
    "gender" TEXT,
    "eyeColor" TEXT,
    "ethnicity" TEXT,
    "bodyType" TEXT,
    "age" TEXT,
    "styles" JSONB,
    "userPhotos" JSONB,
    "submissionDate" TIMESTAMP WITH TIME ZONE,
    "workStatus" TEXT,
    "downloadHistory" JSONB,
    "apiStatus" JSONB,
    "tuneStatus" TEXT,
    "promptsResult" JSONB
);

ALTER TABLE public."userTable" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "basic" 
ON public."userTable" 
TO authenticated 
USING (true);
```

3. Click "Run" to execute the query
4. Verify the table was created successfully

## Step 5: Set Up User Auto-Creation Trigger

1. In the SQL Editor, create a new query
2. Copy and paste the following SQL code:

```sql
-- Drop existing trigger if it exists to prevent "already exists" error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into userTable with conflict handling
  INSERT INTO public."userTable" (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    created_at = EXCLUDED.created_at;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Failed to create userTable record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function when new users sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Click "Run" to execute the query
4. This ensures every new user automatically gets a record in userTable

## Step 6: Configure Authentication Settings

1. In your Supabase dashboard, go to "Authentication"
2. Click on "Providers" in the left sidebar
3. Click on "Email"
4. **Uncheck** the "Confirm email" option
5. Click "Save" to apply changes

> **Note**: This allows users to sign up without email verification, streamlining the onboarding process.

## Step 7: Create Storage Bucket

1. In the SQL Editor, create a new query
2. Copy and paste the following SQL code:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('userphotos', 'userphotos', true);

-- Create policies for user-specific folder access
CREATE POLICY "Give users access to own folder 0" ON storage.objects
  FOR SELECT TO public USING (
    bucket_id = 'userphotos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Give users access to own folder 1" ON storage.objects
  FOR INSERT TO public WITH CHECK (
    bucket_id = 'userphotos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Give users access to own folder 2" ON storage.objects
  FOR UPDATE TO public USING (
    bucket_id = 'userphotos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Give users access to own folder 3" ON storage.objects
  FOR DELETE TO public USING (
    bucket_id = 'userphotos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

3. Click "Run" to execute the query
4. This creates a storage bucket with proper user isolation

## Step 8: Set Up Auto-Delete for Images (Optional)

> **Note**: This feature requires a paid Supabase plan. Skip this step if you're on the free tier.

1. In the SQL Editor, create a new query
2. Copy and paste the following SQL code:

```sql
-- Create cleanup function (pg_cron extension already installed from step 3)
CREATE OR REPLACE FUNCTION cleanup_old_images()
RETURNS void AS $$
BEGIN
  -- Delete from storage and update table
  DELETE FROM storage.objects
  WHERE bucket_id = 'userphotos'
  AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule job to run daily at 1 AM (proper scheduling)
SELECT cron.schedule('cleanup-old-images', '0 1 * * *', 'SELECT cleanup_old_images()');

-- Optional: Check if the job was scheduled successfully
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-images';
```

3. Click "Run" to execute the query
4. This creates an automated task that runs daily at 1 AM to remove images older than 30 days

## Step 9: Update Your Environment Variables

1. In your project, locate the `.env.local` file
2. Update it with your Supabase credentials:

```env
# Supabase AUTH & DB CVPHOTO
NEXT_PUBLIC_SUPABASE_URL=your_project_url_from_step_2
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_step_2
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_step_2
```

## Step 10: Verify Your Setup

1. Test your connection by running your application locally:
   ```bash
   npm run dev
   ```

2. Try creating a new user account to verify:
   - User authentication works
   - User is automatically added to userTable
   - Storage bucket is accessible

## Troubleshooting

### Common Issues:

1. **Extensions not installing**: Make sure you have the correct permissions and are using the SQL Editor
2. **Trigger already exists error**: This is safe to ignore - it means the trigger is already set up
3. **Storage bucket creation fails**: Make sure you have storage enabled in your Supabase project
4. **pg_cron errors**: This feature requires a paid plan - skip the auto-delete step if you're on the free tier

### Verification Checklist:

- [ ] All extensions are installed
- [ ] userTable exists with correct structure
- [ ] RLS policies are enabled
- [ ] User auto-creation trigger is active
- [ ] Email confirmation is disabled
- [ ] Storage bucket 'userphotos' exists
- [ ] Storage policies are configured
- [ ] Environment variables are set correctly

## Production Deployment Notes

When deploying to production:

1. **Vercel Configuration**: Enable Fluid Compute and set Function Max Duration to 800 seconds
2. **Environment Variables**: Make sure all environment variables are set in your deployment platform
3. **Database Performance**: Consider upgrading to a paid Supabase plan for better performance
4. **Monitoring**: Set up monitoring for your database and storage usage

## Support

If you encounter any issues during setup:

1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the error messages in the SQL Editor
3. Verify your environment variables are correct
4. Check your Supabase project logs for any errors

---

**Important**: Keep your service role key secure and never commit it to version control. Use environment variables for all sensitive data.
