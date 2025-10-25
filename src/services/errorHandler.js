export const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Please check your internet connection.',
      status: null,
      data: null,
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
      data: null,
    };
  }
};

export const showErrorAlert = (error, alertFunction) => {
  const errorInfo = handleError(error);
  alertFunction('Error', errorInfo.message);
};

