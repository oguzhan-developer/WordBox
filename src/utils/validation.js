/**
 * Input validation and sanitization utilities for security
 */

// XSS Protection - Sanitize HTML
export const sanitizeHtml = (html) => {
    if (typeof html !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

// Validate email format
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 254;
};

// Validate password strength
export const validatePassword = (password) => {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
        errors.push('Şifre gereklidir');
        return { isValid: false, errors };
    }
    
    if (password.length < 6) {
        errors.push('Şifre en az 6 karakter olmalıdır');
    }
    
    if (password.length > 128) {
        errors.push('Şifre çok uzun');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validate username
export const validateUsername = (username) => {
    if (!username || typeof username !== 'string') {
        return { isValid: false, error: 'Kullanıcı adı gereklidir' };
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < 2) {
        return { isValid: false, error: 'Kullanıcı adı en az 2 karakter olmalıdır' };
    }
    
    if (trimmed.length > 50) {
        return { isValid: false, error: 'Kullanıcı adı çok uzun' };
    }
    
    // Allow letters, numbers, spaces, and basic punctuation
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_.]+$/.test(trimmed)) {
        return { isValid: false, error: 'Kullanıcı adı geçersiz karakterler içeriyor' };
    }
    
    return { isValid: true, sanitized: sanitizeHtml(trimmed) };
};

// Validate number within range
export const validateNumber = (value, min = 0, max = Infinity) => {
    const num = Number(value);
    
    if (isNaN(num)) return false;
    if (num < min || num > max) return false;
    if (!isFinite(num)) return false;
    
    return true;
};

// Validate level
export const isValidLevel = (level) => {
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return validLevels.includes(level);
};

// Validate URL
export const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

// Sanitize object for safe storage
export const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeHtml(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

// Rate limiting helper (client-side)
export class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }
    
    canAttempt(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || [];
        
        // Clean old attempts
        const recentAttempts = userAttempts.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        
        return true;
    }
    
    reset(key) {
        this.attempts.delete(key);
    }
}

// Validate daily goal
export const validateDailyGoal = (goal) => {
    return validateNumber(goal, 1, 100);
};

// Validate vocabulary data
export const validateVocabularyWord = (word) => {
    if (!word || typeof word !== 'object') {
        return { isValid: false, error: 'Geçersiz kelime verisi' };
    }
    
    if (!word.word || typeof word.word !== 'string' || word.word.trim().length === 0) {
        return { isValid: false, error: 'Kelime gereklidir' };
    }
    
    if (word.word.length > 100) {
        return { isValid: false, error: 'Kelime çok uzun' };
    }
    
    if (!word.turkish || typeof word.turkish !== 'string') {
        return { isValid: false, error: 'Türkçe anlamı gereklidir' };
    }
    
    if (!isValidLevel(word.level)) {
        return { isValid: false, error: 'Geçersiz seviye' };
    }
    
    return { isValid: true };
};

// Escape special characters for regex
export const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
