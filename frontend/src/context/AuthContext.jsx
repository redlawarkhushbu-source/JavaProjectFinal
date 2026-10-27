import React, { createContext, useContext, useState, useEffect } from 'react';
import { findLocationByQuery } from '../services/api';
import { getSafeAvatar } from '../utils/avatarUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if explicitly logged out
    const isLoggedOut = localStorage.getItem('shet_logged_out');
    if (isLoggedOut === 'true') {
      return null;
    }

    const saved = localStorage.getItem('shet_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.locationConfigured) {
          if (!parsed.city || !parsed.district) {
            const locMatch = findLocationByQuery(parsed.location || 'Mumbai');
            parsed.city = parsed.city || locMatch.id;
            parsed.district = parsed.district || locMatch.id;
          }
          parsed.stage = parsed.stage || (parsed.locality || parsed.village ? 2 : 1);
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }

    // Default to unauthenticated (null) so visitors experience the true guest state,
    // GPS login reminder guards, and can log in via Google, Phone OTP, or 1-Click demo.
    return null;
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'demo'

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : '/api';

  useEffect(() => {
    // Check if backend API is reachable
    fetch(`${API_BASE}/health`)
      .then(res => {
        if (res.ok) setBackendStatus('connected');
        else setBackendStatus('demo');
      })
      .catch(() => {
        setBackendStatus('demo');
      });
  }, [API_BASE]);

  // Persist farm location so it survives across login, logout, and browser restarts
  const getPersistedLocation = () => {
    try {
      const raw = localStorage.getItem('shet_persisted_farm_location');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const persistFarmLocation = (locObj) => {
    try {
      localStorage.setItem('shet_persisted_farm_location', JSON.stringify(locObj));
    } catch (e) {}
  };

  const login = async (email, password) => {
    localStorage.removeItem('shet_logged_out');
    const cleanEmail = (email || '').trim();
    const savedLoc = getPersistedLocation();

    if (backendStatus === 'connected') {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (response.ok) {
          const data = await response.json();
          const mergedUser = savedLoc ? {
            ...data.user,
            locationConfigured: true,
            city: savedLoc.city || data.user.city,
            district: savedLoc.district || data.user.district,
            locality: savedLoc.locality || data.user.locality,
            village: savedLoc.village || data.user.village,
            location: savedLoc.location || data.user.location,
            address: savedLoc.address || data.user.address,
            stage: savedLoc.stage || data.user.stage || 1,
            lat: savedLoc.lat ?? data.user.lat,
            lng: savedLoc.lng ?? data.user.lng,
            isGps: Boolean(savedLoc.isGps)
          } : data.user;

          setUser(mergedUser);
          localStorage.setItem('shet_user', JSON.stringify(mergedUser));
          localStorage.setItem('shet_token', data.token);
          return { success: true };
        }
      } catch (e) {
        console.warn('Backend login fallback to demo:', e);
      }
    }

    const userName = email.split('@')[0] || "Farmer";
    const farmerUser = {
      id: Date.now(),
      fullName: userName,
      fullNameMr: userName,
      email: email,
      phone: "",
      locationConfigured: Boolean(savedLoc),
      location: savedLoc?.location || "",
      village: savedLoc?.village || "",
      locality: savedLoc?.locality || "",
      district: savedLoc?.district || "",
      city: savedLoc?.city || "",
      address: savedLoc?.address || "",
      stage: savedLoc?.stage || (savedLoc?.locality ? 2 : 1),
      lat: savedLoc?.lat ?? 19.0760,
      lng: savedLoc?.lng ?? 72.8777,
      isGps: Boolean(savedLoc?.isGps),
      farmArea: 2.0,
      primaryCrop: "Wheat & Cotton",
      soilType: "Black Soil (Regur)",
      avatarUrl: getSafeAvatar(userName, cleanEmail),
      authProvider: 'email',
      isDemo: false
    };
    setUser(farmerUser);
    localStorage.setItem('shet_user', JSON.stringify(farmerUser));
    return { success: true };
  };

  /**
   * Log in via Google Account
   */
  const loginWithGoogle = (googleUserData) => {
    localStorage.removeItem('shet_logged_out');
    const savedLoc = getPersistedLocation();
    const mergedUser = savedLoc ? {
      ...googleUserData,
      locationConfigured: true,
      city: savedLoc.city || googleUserData.city,
      district: savedLoc.district || googleUserData.district,
      locality: savedLoc.locality || googleUserData.locality,
      village: savedLoc.village || googleUserData.village,
      location: savedLoc.location || googleUserData.location,
      address: savedLoc.address || googleUserData.address,
      stage: savedLoc.stage || googleUserData.stage || 1,
      lat: savedLoc.lat ?? googleUserData.lat,
      lng: savedLoc.lng ?? googleUserData.lng,
      isGps: Boolean(savedLoc.isGps)
    } : googleUserData;

    setUser(mergedUser);
    localStorage.setItem('shet_user', JSON.stringify(mergedUser));
    return { success: true };
  };

  /**
   * Log in via Phone Number SMS OTP
   */
  const loginWithPhone = (phoneUserData) => {
    localStorage.removeItem('shet_logged_out');
    const savedLoc = getPersistedLocation();
    const mergedUser = savedLoc ? {
      ...phoneUserData,
      locationConfigured: true,
      city: savedLoc.city || phoneUserData.city,
      district: savedLoc.district || phoneUserData.district,
      locality: savedLoc.locality || phoneUserData.locality,
      village: savedLoc.village || phoneUserData.village,
      location: savedLoc.location || phoneUserData.location,
      address: savedLoc.address || phoneUserData.address,
      stage: savedLoc.stage || phoneUserData.stage || 1,
      lat: savedLoc.lat ?? phoneUserData.lat,
      lng: savedLoc.lng ?? phoneUserData.lng,
      isGps: Boolean(savedLoc.isGps)
    } : phoneUserData;

    setUser(mergedUser);
    localStorage.setItem('shet_user', JSON.stringify(mergedUser));
    return { success: true };
  };

  /**
   * Register new farmer without taking location upfront
   */
  const register = async (userData) => {
    localStorage.removeItem('shet_logged_out');
    const savedLoc = getPersistedLocation();
    const newUser = {
      id: Date.now(),
      fullName: userData.fullName || "Farmer",
      fullNameMr: userData.fullNameMr || userData.fullName,
      email: userData.email || '',
      phone: userData.phone || '',
      authProvider: 'email',
      locationConfigured: Boolean(savedLoc),
      stage: savedLoc?.stage || 0,
      city: savedLoc?.city || '',
      district: savedLoc?.district || '',
      locality: savedLoc?.locality || '',
      village: savedLoc?.village || '',
      location: savedLoc?.location || '',
      address: savedLoc?.address || '',
      lat: savedLoc?.lat ?? 19.0760,
      lng: savedLoc?.lng ?? 72.8777,
      isGps: Boolean(savedLoc?.isGps),
      farmArea: Number(userData.farmArea) || 2.0,
      primaryCrop: userData.primaryCrop || "Wheat & Soybean",
      soilType: userData.soilType || "Black Soil (Regur)",
      avatarUrl: getSafeAvatar(userData.fullName || 'Farmer', userData.email || userData.phone),
      isDemo: false
    };
    setUser(newUser);
    localStorage.setItem('shet_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  /**
   * Location Updater (Stage 1: District/City; Stage 2: Village/Hyperlocal GPS)
   */
  const updateLocation = ({ city, district, locality, village, address, stage, lat, lng, isGps = false }) => {
    const targetCity = city || district || 'Mumbai';
    const locMatch = findLocationByQuery(targetCity);
    const activeDistrict = district || city || locMatch.id;
    const activeCity = city || locMatch.id;
    const activeLocality = (locality !== undefined ? locality : village) || '';
    const currentStage = stage || (activeLocality.trim().length > 0 ? 2 : 1);
    
    const formattedLocation = activeLocality.trim().length > 0
      ? `${activeLocality.trim()}, ${activeDistrict}, Maharashtra`
      : `${activeDistrict}, Maharashtra`;

    const locPayload = {
      locationConfigured: true,
      city: activeCity,
      district: activeDistrict,
      locality: activeLocality,
      village: activeLocality,
      address: address || formattedLocation,
      location: formattedLocation,
      stage: currentStage,
      lat: lat != null ? Number(lat) : (locMatch.lat || 19.0760),
      lng: lng != null ? Number(lng) : (locMatch.lng || 72.8777),
      isGps: Boolean(isGps)
    };

    // Persist permanently in browser storage so it is remembered across login & logout
    persistFarmLocation(locPayload);

    setUser(prev => {
      const updated = {
        ...(prev || {}),
        ...locPayload
      };
      if (prev) {
        localStorage.setItem('shet_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => {
      let activeDistrict = updatedFields.district || prev?.district;
      let activeCity = updatedFields.city || prev?.city;
      
      if (updatedFields.location && (!activeDistrict || updatedFields.location !== prev?.location)) {
        const match = findLocationByQuery(updatedFields.location);
        activeDistrict = match.id;
        activeCity = match.id;
      }

      const updated = {
        ...(prev || {}),
        ...updatedFields,
        district: activeDistrict || 'Mumbai',
        city: activeCity || 'Mumbai'
      };

      localStorage.setItem('shet_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shet_user');
    localStorage.removeItem('shet_token');
    localStorage.setItem('shet_logged_out', 'true');
    // Note: shet_persisted_farm_location is purposely PRESERVED so farmer location is never lost!
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      backendStatus, 
      login, 
      loginWithGoogle,
      loginWithPhone,
      register, 
      logout, 
      setUser,
      updateLocation,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
