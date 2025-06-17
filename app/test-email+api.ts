// API route to test email sending functionality
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Generate a test verification code
    const { data, error } = await supabase.rpc('generate_verification_code', {
      user_email: email
    });
    
    if (error) {
      console.error('Error generating verification code:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    // Try to send email via edge function
    const { data: emailData, error: emailError } = await supabase.functions.invoke(
      'send-verification-email',
      {
        body: { 
          email, 
          code: data, 
          type: 'verification' 
        }
      }
    );
    
    if (emailError) {
      console.error('Error sending email:', emailError);
      return Response.json({ 
        error: 'Failed to send email',
        details: emailError.message 
      }, { status: 500 });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Test email sent successfully',
      code: emailData?.code // Only in development
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}