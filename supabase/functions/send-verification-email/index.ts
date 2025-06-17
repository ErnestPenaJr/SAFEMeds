import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email service configuration
const EMAIL_SERVICE = Deno.env.get('EMAIL_SERVICE') || 'resend' // 'resend', 'sendgrid', or 'mailgun'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@safemeds.app'
const FROM_NAME = Deno.env.get('FROM_NAME') || 'S.A.F.E. Meds'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code, type = 'verification' } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const subject = type === 'reset' 
      ? 'S.A.F.E. Meds - Password Reset Code'
      : 'S.A.F.E. Meds - Email Verification Code'

    const htmlContent = generateEmailHTML(code, type)
    const textContent = generateEmailText(code, type)

    let emailSent = false
    let error = null

    // Try to send email using configured service
    switch (EMAIL_SERVICE) {
      case 'resend':
        emailSent = await sendWithResend(email, subject, htmlContent, textContent)
        break
      case 'sendgrid':
        emailSent = await sendWithSendGrid(email, subject, htmlContent, textContent)
        break
      case 'mailgun':
        emailSent = await sendWithMailgun(email, subject, htmlContent, textContent)
        break
      default:
        error = 'No email service configured'
    }

    if (!emailSent && !error) {
      error = 'Failed to send email'
    }

    // For development, log the email content
    const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development'
    if (isDevelopment) {
      console.log(`Email would be sent to: ${email}`)
      console.log(`Subject: ${subject}`)
      console.log(`Code: ${code}`)
    }

    return new Response(
      JSON.stringify({ 
        success: emailSent,
        message: emailSent ? 'Verification code sent successfully' : error,
        ...(isDevelopment && { code }) // Only include code in development
      }),
      { 
        status: emailSent ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Resend email service
async function sendWithResend(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Resend API error:', errorData)
      return false
    }

    return true
  } catch (error) {
    console.error('Resend sending error:', error)
    return false
  }
}

// SendGrid email service
async function sendWithSendGrid(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject,
        }],
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        content: [
          {
            type: 'text/plain',
            value: text,
          },
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('SendGrid API error:', errorData)
      return false
    }

    return true
  } catch (error) {
    console.error('SendGrid sending error:', error)
    return false
  }
}

// Mailgun email service
async function sendWithMailgun(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN not configured')
    return false
  }

  try {
    const formData = new FormData()
    formData.append('from', `${FROM_NAME} <${FROM_EMAIL}>`)
    formData.append('to', to)
    formData.append('subject', subject)
    formData.append('text', text)
    formData.append('html', html)

    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Mailgun API error:', errorData)
      return false
    }

    return true
  } catch (error) {
    console.error('Mailgun sending error:', error)
    return false
  }
}

// Generate HTML email content
function generateEmailHTML(code: string, type: string): string {
  const isReset = type === 'reset'
  const title = isReset ? 'Password Reset Code' : 'Email Verification Code'
  const message = isReset 
    ? 'You requested a password reset for your S.A.F.E. Meds account.'
    : 'Welcome to S.A.F.E. Meds! Please verify your email address.'
  
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
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #2563EB;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563EB;
        }
        .code-container {
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code {
          font-size: 36px;
          font-weight: bold;
          color: #2563EB;
          letter-spacing: 8px;
          margin: 10px 0;
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
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🛡️ S.A.F.E. Meds</div>
        <p>Medication Safety Dashboard</p>
      </div>
      
      <h1>${title}</h1>
      <p>${message}</p>
      
      <div class="code-container">
        <p>Your verification code is:</p>
        <div class="code">${code}</div>
        <p>Enter this code in the app to continue.</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong>
        <ul>
          <li>This code expires in 10 minutes</li>
          <li>Don't share this code with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>This email was sent by S.A.F.E. Meds</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content
function generateEmailText(code: string, type: string): string {
  const isReset = type === 'reset'
  const title = isReset ? 'Password Reset Code' : 'Email Verification Code'
  const message = isReset 
    ? 'You requested a password reset for your S.A.F.E. Meds account.'
    : 'Welcome to S.A.F.E. Meds! Please verify your email address.'
  
  return `
S.A.F.E. Meds - ${title}

${message}

Your verification code is: ${code}

Enter this code in the app to continue.

IMPORTANT:
- This code expires in 10 minutes
- Don't share this code with anyone
- If you didn't request this, please ignore this email

This email was sent by S.A.F.E. Meds
If you have any questions, please contact our support team.
  `
}