import { EMAILJS_CONFIG } from '../config/emailjs';

// Initialize EmailJS when service loads
if (typeof window !== 'undefined' && window.emailjs) {
  window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

export const sendPasswordEmail = async (userEmail, userName, password) => {
  try {
    console.log('Sending email to:', userEmail, 'Name:', userName);
    
    if (!window.emailjs) {
      throw new Error('EmailJS not loaded');
    }

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      user_email: userEmail,
      user_password: password,
      company_name: 'ExpenseFlow'
    };

    console.log('Template params:', templateParams);
    console.log('EmailJS config:', EMAILJS_CONFIG);

    const response = await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('EmailJS response:', response);
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error };
  }
};

export const sendOTPEmail = async (userEmail, userName, otp) => {
  try {
    console.log('Sending OTP email to:', userEmail, 'Name:', userName, 'OTP:', otp);
    
    if (!window.emailjs) {
      throw new Error('EmailJS not loaded');
    }

    const templateParams = {
      to_email: userEmail,
      from_name: 'ExpenseFlow Support',
      message: `To authenticate, please use the following One Time Password (OTP): ${otp}\n\nThis OTP will be valid for 10 minutes.\n\nDo not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.\nExpenseFlow will never contact you about this email or ask for any login codes or links. Beware of phishing scams.\n\nThanks for visiting ExpenseFlow!`
    };

    console.log('OTP template params:', templateParams);

    const response = await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.OTP_TEMPLATE_ID,
      templateParams
    );

    console.log('OTP EmailJS response:', response);
    return { success: true, response };
  } catch (error) {
    console.error('OTP EmailJS Error:', error);
    return { success: false, error };
  }
};