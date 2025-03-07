#!/bin/bash

# Create required directories
mkdir -p uploads/stories
mkdir -p uploads/processed
mkdir -p uploads/temp

# Set proper permissions
chmod -R 755 uploads
chmod -R 777 uploads/temp # Temporary directory needs write access for all

# Create .gitignore if it doesn't exist
if [ ! -f uploads/.gitignore ]; then
  echo "*" > uploads/.gitignore
  echo "!.gitignore" >> uploads/.gitignore
fi

echo "Storage directories initialized successfully"

# Create keyspace if not exists
cqlsh -e "CREATE KEYSPACE IF NOT EXISTS vicharcha WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};"

# Create stories table
cqlsh -e "
CREATE TABLE IF NOT EXISTS vicharcha.stories (
    id timeuuid,
    userid text,
    username text,
    userimage text,
    mediaurl text,
    type text,
    duration int,
    isviewed boolean,
    ispremium boolean,
    expiresat timestamp,
    createdat timestamp,
    downloadable boolean,
    isadult boolean,
    category text,
    PRIMARY KEY (id)
) WITH default_time_to_live = 86400;"

# Create stories by user index
cqlsh -e "CREATE INDEX IF NOT EXISTS stories_by_user ON vicharcha.stories (userid);"