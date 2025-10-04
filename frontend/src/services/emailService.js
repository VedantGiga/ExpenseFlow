import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs.js';

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendPasswordEmail = async (userEmail, userName, password) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      user_email: userEmail,
      user_password: password,
      company_name: 'ExpenseFlow'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error };
  }
};