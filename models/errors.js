const APIErrorSource = (errorSource) => {
  try {
    const apiErrorSource = {
      pointer: errorSource.pointer || undefined,
      param: errorSource.param || undefined
    };

    return apiErrorSource;
  } catch (err) {
    throw err;
  }
};

const APIError = (error) => {
  try {
    const apiError = {
      message: error.message || error.title || 'uncaught exception',
      code: error.code || error.statusCode,   // <--
      locations: error.locations || undefined,
      path: error.stack
    }

    if (process.env.NODE_ENV === 'PREP' || process.env.NODE_ENV === 'PROD') apiError.path = undefined;
    
    return apiError;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  APIError
};