"""
Script to verify Supabase connection and display table schema.
Run this to check your database connection and see all tables.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from sqlmodel import SQLModel
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

# Get connection string from environment
db_url = os.getenv("REFLEX_DB_URL", "sqlite:///reflex.db")

print("🔍 Verifying Supabase Connection...")
print(f"Connection URL: {db_url[:50]}...")
print()

try:
    # Create engine
    engine = create_engine(db_url, echo=False)
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to PostgreSQL!")
        print(f"   Version: {version[:50]}...")
        print()
        
        # Get inspector
        inspector = inspect(engine)
        
        # List all tables (check public schema)
        tables = inspector.get_table_names(schema='public')
        if not tables:
            # Try without schema specification
            tables = inspector.get_table_names()
        print(f"📊 Found {len(tables)} tables:")
        print()
        
        # Also check alembic_version table
        with engine.connect() as check_conn:
            try:
                alembic_result = check_conn.execute(text("SELECT version_num FROM alembic_version;"))
                alembic_version = alembic_result.fetchone()[0]
                print(f"📌 Alembic version: {alembic_version}")
                print()
            except Exception:
                print("⚠️  No Alembic version table found (migrations may not be applied)")
                print()
        
        for table_name in sorted(tables):
            print(f"📋 Table: {table_name}")
            columns = inspector.get_columns(table_name)
            print(f"   Columns ({len(columns)}):")
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                default = f" DEFAULT {col['default']}" if col['default'] else ""
                print(f"     - {col['name']}: {col['type']} {nullable}{default}")
            
            # Get row count
            with engine.connect() as count_conn:
                count_result = count_conn.execute(text(f"SELECT COUNT(*) FROM {table_name};"))
                row_count = count_result.fetchone()[0]
                print(f"   Rows: {row_count}")
            print()
        
        print("✅ Database verification complete!")
        print()
        print("💡 To view in Supabase Dashboard:")
        print("   1. Go to https://supabase.com/dashboard")
        print("   2. Select your project")
        print("   3. Navigate to 'Table Editor' in the sidebar")
        print("   4. Click on any table to see data and schema")
        
except Exception as e:
    print(f"❌ Error connecting to database:")
    print(f"   {str(e)}")
    print()
    print("💡 Troubleshooting:")
    print("   1. Check your .env file has REFLEX_DB_URL set")
    print("   2. Verify the connection string is correct")
    print("   3. Ensure your Supabase project is active")
    print("   4. Check network connectivity")

