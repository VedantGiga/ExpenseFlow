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