# EmailJS Setup Guide

## 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Add Email Service
1. Go to **Email Services** in your dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note your **Service ID** (e.g., `service_abc123`)

## 3. Create Email Template
1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

```html
Subject: Your ExpenseFlow Account Password

Hi {{to_name}},

Welcome to ExpenseFlow! Your account has been created by your administrator.

Login Details:
Email: {{user_email}}
Password: {{user_password}}

Please login to ExpenseFlow and change your password immediately for security.

Best regards,
{{company_name}} Team
```

4. Save the template and note your **Template ID** (e.g., `template_xyz789`)

## 4. Get Public Key
1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `user_abc123xyz`)

## 5. Update Configuration
Update the file `frontend/src/config/emailjs.js`:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'your_service_id_here',
  TEMPLATE_ID: 'your_template_id_here', 
  PUBLIC_KEY: 'your_public_key_here'
};
```

## 6. Test the Setup
1. Create a new user in the admin panel
2. Click "Send Password" 
3. Check if the email is received

## Template Variables Used
- `{{to_name}}` - User's name
- `{{to_email}}` - User's email address
- `{{user_email}}` - Login email (same as to_email)
- `{{user_password}}` - Generated password
- `{{company_name}}` - Always "ExpenseFlow"

## Troubleshooting
- Check browser console for EmailJS errors
- Verify all IDs are correct in config file
- Ensure email service is properly connected
- Check spam folder for test emails