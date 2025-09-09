# Event Attendance Management System

A comprehensive event attendance management system built with React, TypeScript, and Supabase.

## Features

- **Event Management**: Create and manage events with multiple venues
- **Participant Registration**: Register participants with detailed information and QR codes
- **Attendance Tracking**: Track attendance across different venues and events
- **User Management**: Role-based access control with different permission levels
- **Reports & Analytics**: Generate attendance reports and export data
- **QR Code Generation**: Automatic QR code generation for each participant

## Prerequisites

- Node.js (v16 or higher)
- Supabase account and project
- npm or yarn

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase project dashboard:
   - Go to Settings > API
   - Copy your Project URL and anon/public key
3. Enable Authentication:
   - Go to Authentication > Settings
   - Enable Email authentication
   - Disable email confirmation (for development)
4. Run the database migration:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/create_event_tracker_schema.sql`
   - Execute the SQL to create all necessary tables and security policies

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

### 3. Application Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Authentication Setup

The application uses Auth0 for authentication. The super admin account is automatically created in the database:

- **Email**: `pranneethpersonal@gmail.com`
- **Role**: Admin (full permissions)

To add more users, use the User Management page after logging in as an admin.

## Database Schema

The application uses the following Supabase tables:

### Events
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `start_date` (timestamptz)
- `end_date` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Venues
- `id` (uuid, primary key)
- `name` (text)
- `location` (text)
- `capacity` (integer)
- `event_id` (uuid, foreign key)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Participants
- `id` (uuid, primary key)
- `participant_id` (text, unique)
- `name` (text)
- `email` (text)
- `phone` (text)
- `department` (text)
- `year_of_studying` (text)
- `college_university` (text)
- `city_district` (text)
- `qr_code` (text)
- `registration_date` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Attendance Records
- `id` (uuid, primary key)
- `participant_id` (uuid, foreign key)
- `event_id` (uuid, foreign key)
- `venue_id` (uuid, foreign key)
- `check_in_time` (timestamptz)
- `check_out_time` (timestamptz)
- `status` (text: 'present', 'absent', 'late')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Users
- `id` (serial, primary key)
- `email` (text, unique)
- `name` (text)
- `role` (text: 'admin', 'staff', 'viewer')
- `accessible_venues` (text array)
- `permissions` (jsonb)
- `password_hash` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** with admin, staff, and viewer roles
- **Secure authentication** with Auth0 integration
- **Data validation** and proper foreign key constraints
- **Audit trails** with created_at and updated_at timestamps

## Quick Start Guide

1. **Set up Supabase project** and copy credentials to `.env`
2. **Run the SQL migration** to create database schema
3. **Install dependencies** with `npm install`
4. **Start the app** with `npm run dev`
5. **Sign in** using Auth0 authentication
6. **Create your first event** and start managing attendance!

## Troubleshooting

### Authentication Error: "no connections enabled"
- Ensure you've enabled Email authentication in Supabase Auth settings
- Check that your Supabase URL and anon key are correct in `.env`

### "Missing Supabase environment variables"
- Make sure you've created a `.env` file with valid Supabase credentials
- Restart the development server after updating environment variables

### Database connection issues
- Verify that you've run the SQL migration in your Supabase project
- Check that RLS policies are properly configured

For more help, check the Supabase documentation or create an issue in this repository.

---

## Previous Setup Instructions (Legacy)

The following instructions are kept for reference but are now automated by the SQL migration:

### 1. Supabase Setup (Legacy)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard and note down:
   - Project URL
   - Anon/Public Key
3. Run the database migration (now automated):
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/create_event_tracker_schema.sql`
   - Execute the SQL to create all necessary tables

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Application Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Legacy Participant Form Fields

The participant registration form now includes the following fields:

- **Participant ID**: Unique identifier for each participant
- **Participant Name**: Full name of the participant
- **Email ID**: Email address
- **Phone Number**: Contact number
- **Name of the Department**: Academic department
- **Year of Studying**: Academic year (1st Year, 2nd Year, etc.)
- **College / University Name**: Institution name
- **City / District**: Location information
- **QR Code**: Automatically generated based on Participant ID

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Auth0 (optional) or Supabase Auth
- **QR Code Generation**: qrcode library
- **Icons**: Lucide React

## Development

To run the application in development mode:

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Features

### Real-time Updates
- All data is synchronized in real-time using Supabase
- No page reloads required for CRUD operations
- Instant updates across all connected clients

### Security
- Row Level Security (RLS) enabled on all tables
- Authenticated users can only access their authorized data
- Secure API endpoints with proper validation

### Performance
- Optimized database queries with proper indexing
- Efficient data loading and caching
- Minimal re-renders with proper state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.