# Supabase Schema Viewing Guide

## How to View Your Database Schema in Supabase

### Method 1: Supabase Dashboard (Visual - Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project: `yrpiyqiocdfbwwtlktgu`

2. **View Tables**
   - Navigate to: **Table Editor** (left sidebar)
   - You'll see all tables: `user`, `profile`, `class`, `class_member`, `compatibility_score`, `microgroup`, `micro_group_member`
   - Click any table to see:
     - Column names and types
     - Data rows
     - Relationships
     - Indexes

3. **View Schema Structure**
   - Navigate to: **Database** → **Tables** (left sidebar)
   - Click on a table name to see:
     - Column details (name, type, nullable, default)
     - Primary keys
     - Foreign keys
     - Indexes
     - Constraints

### Method 2: SQL Editor (Query-Based)

1. **Open SQL Editor**
   - In Supabase Dashboard: **SQL Editor** (left sidebar)
   - Click **New Query**

2. **View All Tables**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

3. **View Table Schema**
   ```sql
   SELECT 
       column_name,
       data_type,
       is_nullable,
       column_default
   FROM information_schema.columns
   WHERE table_name = 'profile'
   ORDER BY ordinal_position;
   ```

4. **View All Columns for All Tables**
   ```sql
   SELECT 
       table_name,
       column_name,
       data_type,
       is_nullable
   FROM information_schema.columns
   WHERE table_schema = 'public'
   ORDER BY table_name, ordinal_position;
   ```

### Method 3: Using psql (Command Line)

1. **Connect to Supabase**
   ```bash
   psql "postgresql://postgres.yrpiyqiocdfbwwtlktgu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
   ```

2. **View Tables**
   ```sql
   \dt
   ```

3. **View Table Structure**
   ```sql
   \d profile
   ```

4. **View All Schemas**
   ```sql
   \dn
   ```

### Method 4: Check Migration Files (Local)

Your schema is also defined in migration files:
- Location: `alembic/versions/`
- Latest migration: `2f5bf907f462_add_b2b_matching_fields.py`
- These files show the exact SQL commands used to create/modify tables

### Current Schema Overview

**Tables:**
- `user` - User accounts (id, email, password_hash, name, profile_complete)
- `profile` - Employee profiles (expertise_skills, growth_skills, department, collaboration_preference, etc.)
- `class` - Enablement pods (class_code, class_name, school, professor, term)
- `class_member` - Pod membership (class_id, user_id)
- `compatibility_score` - Matching scores (user_a_id, user_b_id, score, score_breakdown JSON)
- `microgroup` - Working circles (name, group_code, description)
- `micro_group_member` - Circle membership (group_id, user_id)

**Key Fields Added for B2B Matching:**
- `profile.expertise_skills` (JSON) - Skills employee can teach
- `profile.growth_skills` (JSON) - Skills employee wants to learn
- `profile.department` (string) - Employee department
- `profile.collaboration_preference` (string) - async/live/hybrid
- `profile.current_projects` (JSON) - Current project list

### Verifying Connection

To verify your app is connected to Supabase:

1. **Check Environment Variable**
   ```bash
   cat .env | grep REFLEX_DB_URL
   ```
   Should show: `postgresql://postgres.yrpiyqiocdfbwwtlktgu:...@aws-1-us-east-2.pooler.supabase.com:5432/postgres`

2. **Test Connection**
   ```bash
   source venv/bin/activate
   python3 -c "from app.utils.db_init import init_db; init_db(); print('Connected!')"
   ```

3. **Check in Supabase Dashboard**
   - Go to **Database** → **Connection Pooling**
   - You should see connection activity if the app is running

### Troubleshooting

**Can't see tables?**
- Check you're in the correct project
- Verify you have the right permissions
- Check if migrations were applied: `reflex db migrate`

**Connection errors?**
- Verify `.env` file has correct `REFLEX_DB_URL`
- Check password is URL-encoded (e.g., `!` becomes `%21`)
- Ensure you're using the **Session Pooler** connection string (not direct)

**Schema out of sync?**
- Run migrations: `reflex db migrate`
- Check migration files in `alembic/versions/`
- Compare with Supabase Dashboard

