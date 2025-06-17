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
   - Run the migrations in `supabase/migrations/`
   - Deploy the edge function in `supabase/functions/`

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Email Configuration

The app supports three email services for sending verification codes:

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`:
   ```
   EMAIL_SERVICE=resend
   RESEND_API_KEY=your_api_key
   ```

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to `.env`:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_api_key
   ```

### Option 3: Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your API key and domain
3. Add to `.env`:
   ```
   EMAIL_SERVICE=mailgun
   MAILGUN_API_KEY=your_api_key
   MAILGUN_DOMAIN=your_domain
   ```

## Supabase Setup

### 1. Database Migrations

Run these SQL migrations in your Supabase SQL editor:

1. `20250615153326_peaceful_castle.sql` - Authentication system
2. `20250615164336_royal_island.sql` - Medications table

### 2. Edge Functions

Deploy the email function:

```bash
supabase functions deploy send-verification-email
```

Set environment variables in Supabase dashboard:
- `EMAIL_SERVICE`
- `RESEND_API_KEY` (or your chosen service)
- `FROM_EMAIL`
- `FROM_NAME`
- `ENVIRONMENT`

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