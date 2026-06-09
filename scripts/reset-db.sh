#!/bin/bash
echo "Resetting database..."
rm -f dev.db dev.db-journal
npx prisma db push
npx tsx prisma/seed.ts
echo "Done"
