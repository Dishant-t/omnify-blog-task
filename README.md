# BLOG APP
## Functionalities

User authnetication

Login-Less browsing

Blog creation/edit/viewing

Pagination

## Tech Stack

NextJS

Supabase

netlify

## Installation

### Prerequisites
- Node.js
- Supabase account
- npm included with Node.js installation

### clone the repository 

`git clone https://github.com/Dishant-t/omnify-blog-app.git`

### Install Dependencies

`npm installation --legacy-peer-deps`

### Setup Supabase

Create a superbase project and then create a .env.local file

fill the .env.local file with following data
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
### Setup Schema
```
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY 'Public profiles are viewable by everyone' ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" 
ON posts FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" 
ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" 
ON posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" 
ON posts FOR DELETE USING (auth.uid() = author_id);
```
### you can then run the development server
`npm run dev`

### visit http://localhost:3000/ on your machine to access the blog app

## Alternatively you can visit the app on the following link
https://venerable-twilight-1ffc02.netlify.app/
