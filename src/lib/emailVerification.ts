import axios from 'axios';

export interface EmailVerificationResult {
  isValid: boolean;
  isDisposable: boolean;
  isRoleBased: boolean;
  isCatchAll: boolean;
  isFree: boolean;
  score: number; // 0-100, higher is better
  message: string;
}

/**
 * Verify if an email address is valid and not fake
 * Uses multiple validation methods for comprehensive checking
 */
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  try {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        isDisposable: false,
        isRoleBased: false,
        isCatchAll: false,
        isFree: false,
        score: 0,
        message: 'Invalid email format'
      };
    }

    const domain = email.split('@')[1].toLowerCase();
    const localPart = email.split('@')[0];

    // Check for disposable email domains
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'temp-mail.org',
      'throwaway.email', 'yopmail.com', 'maildrop.cc', 'tempail.com', 'dispostable.com',
      '0-mail.com', 'anonbox.net', 'binkmail.com', 'deadaddress.com', 'fixmail.tk',
      'getnada.com', 'mailcatch.com', 'moakt.com', 'spam4.me', 'tempinbox.com'
    ];

    const isDisposable = disposableDomains.includes(domain);

    // Check for role-based emails
    const roleBasedPatterns = [
      'admin', 'administrator', 'root', 'postmaster', 'hostmaster', 'webmaster',
      'abuse', 'noc', 'security', 'support', 'info', 'contact', 'sales',
      'marketing', 'help', 'noreply', 'no-reply', 'bounce', 'notification'
    ];

    const isRoleBased = roleBasedPatterns.some(pattern =>
      localPart.toLowerCase().includes(pattern)
    );

    // Check for free email providers (less reliable for business)
    const freeProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'icloud.com', 'live.com', 'msn.com', 'protonmail.com', 'zoho.com'
    ];

    const isFree = freeProviders.includes(domain);

    // Try to verify with external API (using a free tier service)
    let isCatchAll = false;
    let externalScore = 50; // Default score

    try {
      // Using Hunter.io API for email verification (you'll need to sign up for a free API key)
      const HUNTER_API_KEY = import.meta.env.VITE_HUNTER_API_KEY;

      if (HUNTER_API_KEY) {
        const response = await axios.get(`https://api.hunter.io/v2/email-verifier`, {
          params: {
            email: email,
            api_key: HUNTER_API_KEY
          }
        });

        const data = response.data.data;
        isCatchAll = data.result === 'catch_all';
        externalScore = data.score || 50;
      } else {
        // Fallback: Try to check MX records (basic check)
        try {
          const mxResponse = await axios.get(`https://dns.google/resolve`, {
            params: {
              name: domain,
              type: 'MX'
            }
          });

          if (mxResponse.data.Answer && mxResponse.data.Answer.length > 0) {
            externalScore = 75; // Domain has MX records
          } else {
            externalScore = 25; // No MX records found
          }
        } catch {
          externalScore = 50; // Unable to check
        }
      }
    } catch (error) {
      console.warn('External email verification failed, using basic checks only');
    }

    // Calculate overall score
    let score = externalScore;

    if (isDisposable) score -= 40;
    if (isRoleBased) score -= 20;
    if (isCatchAll) score -= 15;
    if (isFree) score -= 10;

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine if email is valid based on criteria
    const isValid = score >= 30 && !isDisposable;

    let message = '';
    if (!isValid) {
      if (isDisposable) {
        message = 'Disposable email addresses are not allowed';
      } else if (score < 30) {
        message = 'Email verification failed - please use a valid email address';
      }
    } else if (score >= 70) {
      message = 'Email verified successfully';
    } else {
      message = 'Email appears valid but may have delivery issues';
    }

    return {
      isValid,
      isDisposable,
      isRoleBased,
      isCatchAll,
      isFree,
      score,
      message
    };

  } catch (error) {
    console.error('Email verification error:', error);
    return {
      isValid: false,
      isDisposable: false,
      isRoleBased: false,
      isCatchAll: false,
      isFree: false,
      score: 0,
      message: 'Email verification failed - please try again'
    };
  }
}

/**
 * Alternative email verification using Abstract API (another free option)
 * You can switch to this if Hunter.io doesn't work for you
 */
export async function verifyEmailWithAbstract(email: string): Promise<EmailVerificationResult> {
  try {
    const ABSTRACT_API_KEY = import.meta.env.VITE_ABSTRACT_API_KEY;

    if (!ABSTRACT_API_KEY) {
      throw new Error('Abstract API key not configured');
    }

    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/`, {
      params: {
        api_key: ABSTRACT_API_KEY,
        email: email
      }
    });

    const data = response.data;

    return {
      isValid: data.is_valid_format.value && data.is_smtp_valid.value,
      isDisposable: data.is_disposable_email.value,
      isRoleBased: data.is_role_email.value,
      isCatchAll: data.is_catchall_email.value,
      isFree: data.is_free_email.value,
      score: data.quality_score * 100,
      message: data.is_valid_format.value && data.is_smtp_valid.value
        ? 'Email verified successfully'
        : 'Invalid email address'
    };

  } catch (error) {
    console.error('Abstract API verification failed:', error);
    // Fallback to basic verification
    return verifyEmail(email);
  }
}
