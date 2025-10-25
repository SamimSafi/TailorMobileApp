export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  // Afghan phone number format
  const phoneRegex = /^(\+93|0)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateSearchTerm = (term) => {
  return term && term.trim().length > 0;
};

export const validateInvoiceForm = (invoiceData) => {
  const errors = {};

  if (!invoiceData.totalAmount || !validateAmount(invoiceData.totalAmount)) {
    errors.totalAmount = 'Valid total amount is required';
  }

  if (!invoiceData.dueDate || !validateDate(invoiceData.dueDate)) {
    errors.dueDate = 'Valid due date is required';
  }

  if (!invoiceData.returnDate || !validateDate(invoiceData.returnDate)) {
    errors.returnDate = 'Valid return date is required';
  }

  if (invoiceData.paidAmount && !validateAmount(invoiceData.paidAmount)) {
    errors.paidAmount = 'Valid paid amount is required';
  }

  if (invoiceData.joraCount && isNaN(parseInt(invoiceData.joraCount))) {
    errors.joraCount = 'Valid jora count is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

