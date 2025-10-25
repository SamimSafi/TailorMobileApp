export const MESSAGE_TEMPLATES = {
  INVOICE_REMINDER: {
    id: 'invoice_reminder',
    name: '📋 Invoice Reminder',
    content: 'Hello, this is a reminder about your pending invoice. Please settle payment at your earliest convenience. Thank you!',
    category: 'billing',
  },
  PAYMENT_CONFIRMATION: {
    id: 'payment_confirmation',
    name: '✅ Payment Confirmation',
    content: 'Thank you for your payment! We have received your payment and your account has been updated. We appreciate your business.',
    category: 'billing',
  },
  NEW_OFFER: {
    id: 'new_offer',
    name: '🎉 Special Offer',
    content: 'Great news! We have a special offer for you. Check your account for more details.',
    category: 'marketing',
  },
  APPOINTMENT_REMINDER: {
    id: 'appointment_reminder',
    name: '📅 Appointment Reminder',
    content: 'This is a friendly reminder about your upcoming appointment. Please confirm if you will be able to attend.',
    category: 'general',
  },
  CUSTOM: {
    id: 'custom',
    name: '✏️ Custom Message',
    content: '',
    category: 'custom',
  },
};

export const TEMPLATE_CATEGORIES = {
  billing: 'Billing',
  marketing: 'Marketing',
  general: 'General',
  custom: 'Custom',
};

export const getTemplatesByCategory = (category) => {
  return Object.values(MESSAGE_TEMPLATES).filter(t => t.category === category);
};

export const getTemplateById = (id) => {
  return Object.values(MESSAGE_TEMPLATES).find(t => t.id === id);
};