# Supabase Setup Instructions

## 1. Get Your Supabase Anon Key

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `hlxhzllylxrkgncaddyi`
3. Click on **Settings** (gear icon in sidebar)
4. Click on **API**
5. Copy the **anon public** key

## 2. Create .env File

Create a `.env` file in the project root with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hlxhzllylxrkgncaddyi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Storage Bucket
VITE_SUPABASE_BUCKET=patients

# n8n Webhook Configuration
VITE_WEBHOOK_ID=97f934a7-db3a-478f-a0f0-1cebca68112d
VITE_PROXY_URL=http://localhost:3002
```

Replace `your_anon_key_here` with your actual anon key from step 1.

## 3. Set Up Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket called `patients` (or use existing)
3. Make it **public** if you want direct access (or set up proper RLS policies)
4. Upload patient `.txt` files to this bucket

## 4. Patient File Format

Patient files should be `.txt` files containing the patient data.
The filename (without .txt extension) will be displayed as the patient name in the dropdown.

Example:
- `John_Doe.txt` → displays as "John_Doe" in dropdown
- `Jane_Smith.txt` → displays as "Jane_Smith" in dropdown

## 5. Workflow

1. **Nurse selects patient** from dropdown (loads from Supabase Storage)
2. **Frontend fetches file content** from Supabase
3. **Content is sent to n8n webhook** via the proxy
4. **n8n processes and returns questionnaire** (via "Respond to Webhook" node)
5. **Frontend displays questionnaire** for nurse to complete
6. **Answers are submitted back** to n8n

## 6. Testing Connection

The application will automatically test the Supabase connection on load.
Check the browser console for connection status messages.

## Database Credentials (Reference)

```
Host: aws-1-us-east-2.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.hlxhzllylxrkgncaddyi
Pool Mode: session
```

These are for direct database connections if needed, but the application uses the Storage API via the anon key.

