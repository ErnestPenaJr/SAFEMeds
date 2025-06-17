// API route to test Resend email sending directly
export async function POST(request: Request) {
  // Add CORS headers for web compatibility
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { email, testType = 'verification' } = await request.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Resend API key not configured',
          details: 'Please set RESEND_API_KEY in your environment variables'
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate a test verification code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Prepare email content
    const subject = testType === 'reset' 
      ? 'S.A.F.E. Meds - Test Password Reset Code'
      : 'S.A.F.E. Meds - Test Email Verification';

    const htmlContent = generateTestEmailHTML(testCode, testType);
    const textContent = generateTestEmailText(testCode, testType);

    // Send email using Resend API directly
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${process.env.FROM_NAME || 'S.A.F.E. Meds'} <${process.env.FROM_EMAIL || 'noreply@safemeds.app'}>`,
        to: [email],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email via Resend',
          details: errorData,
          status: resendResponse.status
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const resendData = await resendResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully via Resend!',
        emailId: resendData.id,
        testCode: testCode, // Include for testing purposes
        provider: 'Resend',
        to: email
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Test email error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Generate HTML email content for testing
function generateTestEmailHTML(code: string, type: string): string {
  const isReset = type === 'reset';
  const title = isReset ? 'Test Password Reset Code' : 'Test Email Verification';
  const message = isReset 
    ? 'This is a test password reset email from your S.A.F.E. Meds application.'
    : 'This is a test verification email from your S.A.F.E. Meds application.';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background-color: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #2563EB;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563EB;
          margin-bottom: 8px;
        }
        .tagline {
          color: #64748B;
          font-size: 16px;
        }
        .test-badge {
          background: #FEF3C7;
          color: #D97706;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          margin: 20px 0;
        }
        .code-container {
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
          border: 2px solid #2563EB;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code {
          font-size: 42px;
          font-weight: bold;
          color: #2563EB;
          letter-spacing: 8px;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
        }
        .code-label {
          color: #1E40AF;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .code-instruction {
          color: #3730A3;
          font-size: 14px;
          margin-top: 10px;
        }
        .success-message {
          background: #F0FDF4;
          border-left: 4px solid #10B981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .success-title {
          color: #059669;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .success-text {
          color: #047857;
          font-size: 14px;
        }
        .warning {
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #E2E8F0;
          margin-top: 30px;
          color: #64748B;
          font-size: 14px;
        }
        .footer-logo {
          color: #2563EB;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️ S.A.F.E. Meds</div>
          <div class="tagline">Medication Safety Dashboard</div>
        </div>
        
        <div class="test-badge">✅ TEST EMAIL</div>
        
        <h1>${title}</h1>
        <p>${message}</p>
        
        <div class="success-message">
          <div class="success-title">🎉 Email Configuration Working!</div>
          <div class="success-text">
            Your Resend integration is properly configured and emails are being sent successfully.
          </div>
        </div>
        
        <div class="code-container">
          <div class="code-label">Your test verification code:</div>
          <div class="code">${code}</div>
          <div class="code-instruction">This code would be used for verification in the actual app</div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Test Email Information:</strong>
          <ul>
            <li>This is a test email to verify your email configuration</li>
            <li>In production, codes expire in 10 minutes</li>
            <li>This test code is for demonstration purposes only</li>
          </ul>
        </div>
        
        <div class="footer">
          <div class="footer-logo">S.A.F.E. Meds</div>
          <p>Email successfully sent via Resend API</p>
          <p>If you received this email, your configuration is working correctly!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate plain text email content for testing
function generateTestEmailText(code: string, type: string): string {
  const isReset = type === 'reset';
  const title = isReset ? 'Test Password Reset Code' : 'Test Email Verification';
  const message = isReset 
    ? 'This is a test password reset email from your S.A.F.E. Meds application.'
    : 'This is a test verification email from your S.A.F.E. Meds application.';
  
  return `
S.A.F.E. Meds - ${title}

✅ TEST EMAIL

${message}

🎉 Email Configuration Working!
Your Resend integration is properly configured and emails are being sent successfully.

Your test verification code: ${code}

This code would be used for verification in the actual app.

⚠️ Test Email Information:
- This is a test email to verify your email configuration
- In production, codes expire in 10 minutes  
- This test code is for demonstration purposes only

---
S.A.F.E. Meds
Email successfully sent via Resend API
If you received this email, your configuration is working correctly!
  `;
}