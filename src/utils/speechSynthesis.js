// Advanced Text-to-Speech utility for WordBox
// Provides high-quality English pronunciation with optimized voice selection
// Supports both American (US) and British (UK) accents

// Get accent preference from localStorage
const getAccentPreference = () => {
    try {
        const prefs = localStorage.getItem('wordbox-user');
        if (prefs) {
            const parsed = JSON.parse(prefs);
            return parsed?.preferences?.voiceAccent || 'american';
        }
    } catch (e) {
        console.warn('Error reading accent preference:', e);
    }
    return 'american';
};

/**
 * Get the best available English voice from the browser based on accent preference
 * @param {string} accent - 'american' or 'british'
 */
const getBestEnglishVoice = (accent = null) => {
    if (!window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    const selectedAccent = accent || getAccentPreference();
    
    // American English voices priority
    const americanVoices = [
        'Google US English',
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Jenny Online (Natural) - English (United States)',
        'Microsoft Guy Online (Natural) - English (United States)',
        'Microsoft Zira - English (United States)',
        'Microsoft David - English (United States)',
        'Samantha',
        'Alex',
        'Allison',
        'Ava',
        'Susan',
        'Tom',
    ];
    
    // British English voices priority
    const britishVoices = [
        'Google UK English Female',
        'Google UK English Male',
        'Microsoft Emma - English (United Kingdom)',
        'Microsoft Libby - English (United Kingdom)',
        'Microsoft Ryan Online (Natural) - English (United Kingdom)',
        'Microsoft Sonia Online (Natural) - English (United Kingdom)',
        'Daniel',
        'Kate',
        'Oliver',
        'Serena',
    ];
    
    const voicePriority = selectedAccent === 'british' ? britishVoices : americanVoices;
    const fallbackPriority = selectedAccent === 'british' ? americanVoices : britishVoices;

    // Try to find prioritized voices
    for (const priorityName of voicePriority) {
        const voice = voices.find(v => v.name === priorityName);
        if (voice) return voice;
    }
    
    // Try fallback voices
    for (const priorityName of fallbackPriority) {
        const voice = voices.find(v => v.name === priorityName);
        if (voice) return voice;
    }

    // Fallback: Find any voice matching the preferred accent
    const langCode = selectedAccent === 'british' ? 'en-GB' : 'en-US';
    const accentVoices = voices.filter(v => 
        v.lang === langCode || v.lang.includes(selectedAccent === 'british' ? 'GB' : 'US')
    );
    
    if (accentVoices.length > 0) {
        const preferredVoice = accentVoices.find(v => 
            v.name.includes('Google') || 
            v.name.includes('Microsoft') ||
            v.name.includes('Natural')
        );
        return preferredVoice || accentVoices[0];
    }

    // Last resort: any English voice
    const enVoices = voices.filter(v => v.lang.startsWith('en-'));
    return enVoices[0] || voices[0];
};

/**
 * Enhanced speech synthesis with better voice, rate, and pitch
 * @param {string} text - The text to speak
 * @param {Object} options - Speech options
 * @param {number} options.rate - Speech rate (0.5-2.0, default 0.9)
 * @param {number} options.pitch - Voice pitch (0.0-2.0, default 1.0)
 * @param {number} options.volume - Volume (0.0-1.0, default 1.0)
 * @param {string} options.accent - Voice accent ('american' or 'british')
 * @param {Function} options.onEnd - Callback when speech ends
 * @param {Function} options.onError - Callback on error
 */
export const speak = (text, options = {}) => {
    try {
        if (!window.speechSynthesis) {
            console.warn('Speech synthesis not supported in this browser');
            options.onError?.('not-supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice (wait for voices to load if needed)
        const setVoiceAndSpeak = () => {
            const bestVoice = getBestEnglishVoice(options.accent);
            if (bestVoice) {
                utterance.voice = bestVoice;
                utterance.lang = bestVoice.lang;
            } else {
                utterance.lang = options.accent === 'british' ? 'en-GB' : 'en-US';
            }

            // Apply options with better defaults
            utterance.rate = options.rate ?? 0.9; // Slightly slower for clarity
            utterance.pitch = options.pitch ?? 1.0; // Natural pitch
            utterance.volume = options.volume ?? 1.0; // Full volume

            // Event handlers
            utterance.onend = () => {
                options.onEnd?.();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                options.onError?.(event.error);
            };

            // Speak
            window.speechSynthesis.speak(utterance);
        };

        // Check if voices are loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            setVoiceAndSpeak();
        } else {
            // Wait for voices to load (Chrome/Edge requirement)
            window.speechSynthesis.onvoiceschanged = () => {
                setVoiceAndSpeak();
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    } catch (error) {
        console.error('Error in speech synthesis:', error);
        options.onError?.(error.message);
    }
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
    try {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    } catch (error) {
        console.error('Error stopping speech:', error);
    }
};

/**
 * Check if speech synthesis is speaking
 */
export const isSpeaking = () => {
    try {
        return window.speechSynthesis?.speaking || false;
    } catch {
        return false;
    }
};

/**
 * Pause ongoing speech
 */
export const pauseSpeaking = () => {
    try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    } catch (error) {
        console.error('Error pausing speech:', error);
    }
};

/**
 * Resume paused speech
 */
export const resumeSpeaking = () => {
    try {
        if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    } catch (error) {
        console.error('Error resuming speech:', error);
    }
};

/**
 * Get list of available voices
 */
export const getAvailableVoices = () => {
    try {
        if (!window.speechSynthesis) return [];
        return window.speechSynthesis.getVoices();
    } catch (error) {
        console.error('Error getting voices:', error);
        return [];
    }
};

/**
 * Preload voices (useful for Chrome/Edge)
 */
export const preloadVoices = () => {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            resolve([]);
            return;
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                const loadedVoices = window.speechSynthesis.getVoices();
                resolve(loadedVoices);
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    });
};

export default {
    speak,
    stopSpeaking,
    isSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    getAvailableVoices,
    preloadVoices,
};
