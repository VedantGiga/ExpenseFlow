// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const EMAILJS_CONFIG = {
  // Your EmailJS Service ID (from EmailJS dashboard)
  SERVICE_ID: 'service_expenseflow',
  
  // Your EmailJS Template ID (from EmailJS dashboard)
  TEMPLATE_ID: 'template_password_reset',
  
  // Your EmailJS Public Key (from EmailJS dashboard)
  PUBLIC_KEY: 'your_public_key_here'
};

// Email Template Variables (for reference)
export const TEMPLATE_VARS = {
  to_email: 'Recipient email address',
  to_name: 'Recipient name',
  user_email: 'User login email',
  user_password: 'Generated password',
  company_name: 'ExpenseFlow'
};