// Test script to verify email sending functionality
const testEmailSending = async () => {
  console.log('Testing email sending configuration...');
  
  // Check environment variables
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    return false;
  }
  
  console.log('✓ Environment variables configured');
  
  // Test email service configuration
  const emailService = process.env.EMAIL_SERVICE || 'resend';
  console.log(`Email service: ${emailService}`);
  
  switch (emailService) {
    case 'resend':
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not configured');
        return false;
      }
      console.log('✓ Resend API key configured');
      break;
    case 'sendgrid':
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY not configured');
        return false;
      }
      console.log('✓ SendGrid API key configured');
      break;
    case 'mailgun':
      if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        console.error('❌ MAILGUN_API_KEY or MAILGUN_DOMAIN not configured');
        return false;
      }
      console.log('✓ Mailgun configuration found');
      break;
    default:
      console.error('❌ Unknown email service:', emailService);
      return false;
  }
  
  console.log('✓ Email configuration appears valid');
  return true;
};

// Run the test
testEmailSending().then(success => {
  if (success) {
    console.log('\n🎉 Email configuration test passed!');
    console.log('\nTo test actual email sending:');
    console.log('1. Try signing up with a new account');
    console.log('2. Check the browser console for development codes');
    console.log('3. Check your email inbox for verification emails');
  } else {
    console.log('\n❌ Email configuration test failed!');
    console.log('Please check your environment variables and try again.');
  }
});

module.exports = { testEmailSending };