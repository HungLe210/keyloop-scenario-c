const validator = require('validator');

/**
 * Strip all HTML tags - plain text only
 * Uses simple regex to remove HTML tags for API input sanitization
 * 
 * ⚠️ Note: This is NOT for rendering HTML safely in browsers
 * This is for cleaning user input in REST API (JSON data)
 * 
 * @param {string} dirty - Raw string with potential HTML
 * @returns {string} - Plain text without HTML tags
 */
function stripHtml(dirty) {
    if (typeof dirty !== 'string') return dirty;

    // Remove all HTML tags using regex
    // Example: "<b>Hello</b>" → "Hello"
    return dirty
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&lt;/g, '<')   // Decode HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .trim();
}

/**
 * Trim whitespace from string
 * @param {string} str - String to trim
 * @returns {string} - Trimmed string
 */
function trim(str) {
    if (typeof str !== 'string') return str;
    return validator.trim(str);
}

/**
 * Sanitize array of strings
 * @param {Array<string>} arr - Array of strings
 * @param {string} method - Sanitization method ('stripHtml' or 'trim')
 * @returns {Array<string>} - Sanitized array
 */
function array(arr, method = 'stripHtml') {
    if (!Array.isArray(arr)) return arr;

    const sanitizer = method === 'trim' ? trim : stripHtml;

    return arr.map(item => sanitizer(item));
}

module.exports = {
    stripHtml,
    trim,
    array
};
