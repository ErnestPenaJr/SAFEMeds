# S.A.F.E. Meds - Medication Safety Dashboard

A comprehensive medication management app built with Expo and React Native, featuring drug interaction checking, scheduling, and health reporting.

## Features

- 🔐 **Secure Authentication** - Email/password with verification codes
- 💊 **Medication Management** - Add, edit, and track medications
- ⚠️ **Drug Interaction Checking** - Real-time safety alerts using RxNav API
- 📅 **Smart Scheduling** - Personalized medication schedules
- 📊 **Health Reports** - Track side effects and reactions
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🔄 **Offline Support** - Basic functionality without internet

## Tech Stack

- **Frontend**: Expo 52, React Native, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **APIs**: RxNav (National Library of Medicine)
- **Email**: Resend/SendGrid/Mailgun support
- **Icons**: Lucide React Native

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account
- Email service account (Resend recommended)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd safe-meds-app
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your configuration:
   - Supabase URL and anon key
   - Email service API key
   - Email settings

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/` **in order**:
     1. `20250615153326_peaceful_castle.sql` - Authentication system
     2. `20250615164336_royal_island.sql` - Medications table
     3. `20250616131951_precious_mouse.sql` - Stripe integration
     4. `20250619161950_wild_rice.sql` - Additional features
     5. `add_user_profiles_role_column.sql` - User roles (REQUIRED)
   - Deploy the edge functions in `supabase/functions/`
   - **CRITICAL**: Configure environment variables in Supabase Edge Functions

4. **Configure Supabase Edge Functions Environment Variables**
   
   In your Supabase dashboard, go to Edge Functions → send-verification-email → Settings and add:
   
   ```
   EMAIL_SERVICE=resend
   RESEND_API_KEY=your_actual_api_key_here
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=S.A.F.E. Meds
   ENVIRONMENT=production
   ```
   
   **IMPORTANT**: Replace `your_actual_api_key_here` with your real API key from your email service provider.

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Email Configuration

The app supports three email services for sending verification codes:

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env`:
   ```
   EMAIL_SERVICE=resend
   RESEND_API_KEY=re_your_actual_key_here
   ```
4. **CRITICAL**: Also add the same variables to your Supabase Edge Function environment variables

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to `.env`:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.your_actual_key_here
   ```
4. **CRITICAL**: Also add the same variables to your Supabase Edge Function environment variables

### Option 3: Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your API key and domain
3. Add to `.env`:
   ```
   EMAIL_SERVICE=mailgun
   MAILGUN_API_KEY=your_actual_key_here
   MAILGUN_DOMAIN=your_domain
   ```
4. **CRITICAL**: Also add the same variables to your Supabase Edge Function environment variables

## Supabase Setup

### 1. Database Migrations

Run these SQL migrations in your Supabase SQL editor **in the exact order listed**:

1. `20250615153326_peaceful_castle.sql` - Authentication system
2. `20250615164336_royal_island.sql` - Medications table
3. `20250616131951_precious_mouse.sql` - Stripe integration
4. `20250619161950_wild_rice.sql` - Additional features
5. `add_user_profiles_role_column.sql` - **REQUIRED** - Adds missing role column

### 2. Edge Functions

Deploy the email function:

```bash
supabase functions deploy send-verification-email
```

**CRITICAL**: Set environment variables in Supabase dashboard under Edge Functions → send-verification-email → Settings:

- `EMAIL_SERVICE` (e.g., "resend")
- `RESEND_API_KEY` (your actual API key, not a placeholder)
- `FROM_EMAIL` (e.g., "noreply@yourdomain.com")
- `FROM_NAME` (e.g., "S.A.F.E. Meds")
- `ENVIRONMENT` (e.g., "production")

**Common Issues:**
- If you get "Failed to send email" errors, check that your API key is valid and properly set in both your local `.env` and Supabase Edge Function environment variables
- Make sure your email service account is active and has sending permissions
- For Resend, verify your domain if using a custom domain

### 3. Database Schema Requirements

The application requires the following tables with specific columns:

- `user_profiles` - Must include `role` column (added by migration)
- `medications` - For medication tracking
- `email_verification_codes` - For email verification
- Stripe-related tables for payment processing

## Project Structure

```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main app tabs
├── _layout.tsx      # Root layout
components/          # Reusable components
hooks/              # Custom hooks
lib/                # Utilities and API clients
supabase/           # Database and functions
├── migrations/     # Database migrations (run in order!)
└── functions/      # Edge functions
```

## Key Features

### Drug Interaction Checking
- Uses RxNav API from National Library of Medicine
- Real-time interaction detection
- Severity classification (major, moderate, minor)
- Caching for improved performance

### Smart Scheduling
- Personalized medication schedules
- Interaction-aware timing recommendations
- Status tracking (taken, missed, upcoming)
- Calendar integration

### Health Reporting
- Side effect tracking
- Adverse reaction reporting
- Severity classification
- Timeline visualization

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Adaptive layouts and typography
- Touch-friendly interactions

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build:web
```

### Deployment

The app can be deployed to:
- **Web**: Netlify, Vercel, or any static host
- **Mobile**: Expo Application Services (EAS)
- **Desktop**: Electron (via Expo)

## Troubleshooting

### Common Issues

1. **"Could not find the 'role' column" error**
   - Run the `add_user_profiles_role_column.sql` migration
   - Refresh your Supabase schema cache

2. **"Failed to send email" error**
   - Check your email service API key is valid
   - Verify environment variables are set in both local `.env` and Supabase Edge Functions
   - Ensure your email service account has sending permissions

3. **Authentication issues**
   - Verify Supabase URL and anon key are correct
   - Check that all migrations have been run in order
   - Ensure RLS policies are properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [support@safemeds.app](mailto:support@safemeds.app)

## Disclaimer

This app is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider before making any changes to your medication regimen.