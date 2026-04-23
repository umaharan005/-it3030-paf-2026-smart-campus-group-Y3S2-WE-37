import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { updateProfile as updateProfileApi } from '../services/profileApi';

const AuthContext = createContext();

// Checks if a string looks like a JWT token (should NOT be treated as a name)
const isTokenLike = (value) =>
    typeof value === 'string' && value.length > 40 && value.split('.').length === 3;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [profileOverride, setProfileOverride] = useState(() => {
    const raw = localStorage.getItem('profileOverride');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      
      try {
        const decoded = jwtDecode(token);
        
        // Build base user state from decoded token + any stored profile override
        setUser({
          email: decoded.sub || decoded.email,
          roles: decoded.roles || decoded.authorities || [],
          ...(profileOverride || {}),
          ...decoded,
        });
        
        // Skip backend profile fetch for Google-issued tokens
        const isGoogleToken = decoded.iss && decoded.iss.includes('google');
        if (!isGoogleToken) {
          fetchProfile(token);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('profileOverride');
      setUser(null);
      setLoading(false);
    }
  }, [token, profileOverride]);

  const fetchProfile = async (jwt) => {
    try {
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setUser(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (jwt, profile = null) => {
    setLoading(true);
    if (profile) {
      // Sanitize incoming profile to avoid storing token-like values as names
      const safe = { ...profile };
      if (safe.name && isTokenLike(safe.name)) safe.name = '';
      if (safe.email && isTokenLike(safe.email)) safe.email = '';
      if (safe.picture && isTokenLike(safe.picture)) safe.picture = '';
      setProfileOverride(safe);
      localStorage.setItem('profileOverride', JSON.stringify(safe));
    }
    setToken(jwt);
  };

  const logout = () => {
    setToken(null);
    setProfileOverride(null);
    localStorage.removeItem('token');
    localStorage.removeItem('profileOverride');
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const updated = await updateProfileApi(payload);
    setUser((prev) => ({ ...prev, ...updated }));

    const nextOverride = {
      name: updated?.name || '',
      email: updated?.email || '',
      picture: updated?.picture || ''
    };
    setProfileOverride(nextOverride);
    localStorage.setItem('profileOverride', JSON.stringify(nextOverride));

    return updated;
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
  };

  // Safe resolved display values — always prefer profileOverride (Google data) over token claims
  const rawName = profileOverride?.name || user?.name || user?.given_name || '';
  const displayName = isTokenLike(rawName) ? (user?.email?.split('@')[0] || 'User') : (rawName || user?.email?.split('@')[0] || 'User');
  const displayPicture = profileOverride?.picture || user?.picture || null;
  const displayEmail = profileOverride?.email || user?.email || '';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, hasRole, displayName, displayPicture, displayEmail, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
