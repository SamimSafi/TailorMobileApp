export const formatCurrency = (amount, currency = 'AFN') => {
  if (!amount) return `0 ${currency}`;
  return `${parseFloat(amount).toLocaleString()} ${currency}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Format: +93 799 123 456
  return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

