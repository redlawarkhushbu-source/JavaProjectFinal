import { getSafeAvatar } from '../utils/avatarUtils';
/**
 * Real Google Authentication Service for Shet Samarthan
 * Powered by Google Identity Services (GIS) OAuth 2.0 SDK
 * 
 * Absolutely NO mock or demo accounts.
 * Connects directly to Google's official accounts.google.com authentication.
 */

/**
 * Retrieve the active Google Client ID from environment or saved user settings
 */
export function getGoogleClientId() {
  const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_CLIENT_ID : null;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10 && !envKey.includes('your_')) {
    return envKey.trim();
  }
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem('shet_google_client_id') : null;
  if (savedKey && typeof savedKey === 'string' && savedKey.trim().length > 10) {
    return savedKey.trim();
  }
  return '';
}

/**
 * Save Google Client ID directly from the UI
 */
export function saveGoogleClientId(key) {
  if (key && key.trim().length > 10) {
    localStorage.setItem('shet_google_client_id', key.trim());
    return true;
  }
  return false;
}

/**
 * Check if a valid Google OAuth Client ID is configured
 */
export function isGoogleClientConfigured() {
  const key = getGoogleClientId();
  return Boolean(key && key.includes('.apps.googleusercontent.com'));
}

/**
 * Decode JWT token returned by Google Identity Services
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT credential:', e);
    return null;
  }
}

/**
 * Initialize and render the official Google Sign-In button using GIS
 */
export function initializeGoogleSignIn(containerElement, onCredentialSuccess, onError) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    if (onError) onError('Google Client ID is missing.');
    return false;
  }

  if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
    if (onError) onError('Google Identity Services SDK is still loading. Please try again in a moment.');
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential) {
          const profile = parseJwt(response.credential);
          if (profile) {
            const farmerProfile = createFarmerProfileFromGoogle(profile);
            onCredentialSuccess(farmerProfile);
          } else if (onError) {
            onError('Could not extract Google account profile from credential.');
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });

    if (containerElement) {
      containerElement.innerHTML = '';
      window.google.accounts.id.renderButton(containerElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 380
      });
    }

    return true;
  } catch (err) {
    console.error('Error initializing Google Sign-In:', err);
    if (onError) onError(err.message || 'Google Sign-In initialization failed.');
    return false;
  }
}

/**
 * Trigger Google One Tap or prompt
 */
export function promptGoogleOneTap(onCredentialSuccess, onError) {
  const clientId = getGoogleClientId();
  if (!clientId) return false;

  if (window.google?.accounts?.id) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential) {
          const profile = parseJwt(response.credential);
          if (profile) {
            onCredentialSuccess(createFarmerProfileFromGoogle(profile));
          }
        }
      }
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Google One Tap dismissed or not displayed:', notification.getNotDisplayedReason());
      }
    });
    return true;
  }
  return false;
}

/**
 * Create genuine farmer profile from real Google identity
 * Note: Location setup is intentionally deferred to post-login as requested.
 */
export function createFarmerProfileFromGoogle(googleUser) {
  return {
    id: googleUser.sub || `google_${Date.now()}`,
    fullName: googleUser.name || 'Google Farmer',
    fullNameMr: googleUser.name || 'गुगल शेतकरी',
    email: googleUser.email,
    avatarUrl: googleUser.picture || getSafeAvatar(googleUser.name || 'Google Farmer', googleUser.email),
    phone: '',
    authProvider: 'google',
    isGoogleAuth: true,
    locationConfigured: false, // Deferred location
    stage: 0,
    city: '',
    district: '',
    locality: '',
    village: '',
    location: '',
    farmArea: 2.5,
    primaryCrop: 'Soybean & Sugarcane',
    soilType: 'Black Soil (Regur)',
    isDemo: false
  };
}
