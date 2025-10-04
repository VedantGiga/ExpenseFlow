// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const EMAILJS_CONFIG = {
  // Your EmailJS Service ID (from EmailJS dashboard)
  SERVICE_ID: 'service_vb86q0g',
  
  // Your EmailJS Template ID (from EmailJS dashboard)
  TEMPLATE_ID: 'template_9oumaqj',
  
  // OTP Template ID
  OTP_TEMPLATE_ID: 'template_370qqdo',
  
  // Your EmailJS Public Key (from EmailJS dashboard)
  PUBLIC_KEY: 'ukgrP7KR2JVYsfFql'
};

// Email Template Variables (for reference)
export const TEMPLATE_VARS = {
  // Regular password email template (template_9oumaqj)
  REGULAR_PASSWORD: {
    to_email: 'Recipient email address',
    to_name: 'Recipient name',
    user_email: 'User login email',
    user_password: 'Generated password',
    company_name: 'ExpenseFlow'
  },
  
  // Password reset template (template_vkqm00r)
  PASSWORD_RESET: {
    to_email: 'Recipient email address',
    to_name: 'Recipient name',
    user_email: 'User login email',
    new_password: 'New generated password',
    company_name: 'ExpenseFlow',
    reset_date: 'Date of password reset'
  }
};