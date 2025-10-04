# Database Setup

## Local Development
1. Install PostgreSQL with pgAdmin
2. Create database: `expenseflow`
3. Run `schema.sql` in pgAdmin Query Tool
4. Copy `.env.example` to `.env` and update credentials

## Version Control
- Schema changes go in `migrations/` folder
- Name format: `001_description.sql`
- Never modify existing migrations
- Always create new migration files for changes

## Backup/Export
```bash
pg_dump -U postgres expenseflow > backup.sql
```

## Restore
```bash
psql -U postgres expenseflow < backup.sql
```