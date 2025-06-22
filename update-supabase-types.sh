#!/bin/bash
# Regenerate Supabase types and update the date in the types file

PROJECT_ID=tfzvtzqybgbzxcxozdes
TYPES_FILE="components/general/supabase.types.ts"
DATE_STR="$(date +%Y-%m-%d)"

echo "Generating Supabase types..."
npx supabase gen types typescript --project-id $PROJECT_ID --schema public > $TYPES_FILE

# Replace the date placeholder
sed -i "s|Last updated: __SUPABASE_TYPES_DATE__|Last updated: $DATE_STR|" $TYPES_FILE

echo "Supabase types updated with date: $DATE_STR"
