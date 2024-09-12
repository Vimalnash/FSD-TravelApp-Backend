

// Returns response for try catch error occurred.
function serverError(error, res) {
    return res.status(500).json({error:"Internal Server Error", errorData: error});
};

// For Middleware Auth Error
function authError (res, message) {
    return res.status(500).json({error: message})
}

export { serverError, authError }