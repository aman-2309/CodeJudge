const validator = require('validator')

const validate = (data) => {
    const mandatory = ['firstName', 'emailId', 'password'];
    
    const missing = mandatory.filter((k) => !data[k] || String(data[k]).trim() === '');

    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    if (!validator.isEmail(data.emailId)) {
        throw new Error("Please provide a valid email address.");
    }
    if (!validator.isStrongPassword(data.password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol.");
    }
    if (data.firstName.trim().length < 3) {
        throw new Error("First name must be at least 3 characters long.");
    }
}

module.exports = validate