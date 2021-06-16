import React, {ReactNode, createContext, useState, useContext} from 'react';
import {useHistory} from 'react-router-dom';

export interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthInfo {
  token: string | null;
  userInfo: UserInfo | null;
  expiresAt: number | null;
}

export interface Auth {
  authInfo: AuthInfo;
  setAuthInfo(authInfo: AuthInfo): void;
  logout(): void;
  isAuthenticated(): boolean;
  isAdmin(): boolean;
}

const UNAUTHORIZED: AuthInfo = {
  token: null,
  userInfo: null,
  expiresAt: null,
};
const NO_OP = () => {};

const AuthContext = createContext<Auth>({
  authInfo: UNAUTHORIZED,
  setAuthInfo: NO_OP,
  logout: NO_OP,
  isAdmin: () => false,
  isAuthenticated: () => false,
});

const AuthProvider = ({children}: {children: ReactNode}) => {
  const history = useHistory();

  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');
  const expiresAt = localStorage.getItem('expiresAt');

  const [authState, setAuthState] = useState<AuthInfo>({
    token,
    expiresAt: Number(expiresAt),
    userInfo: userInfo && JSON.parse(userInfo),
  });

  const setAuthInfo = ({token, userInfo, expiresAt}: AuthInfo) => {
    token && localStorage.setItem('token', token);
    userInfo && localStorage.setItem('userInfo', JSON.stringify(userInfo));
    expiresAt && localStorage.setItem('expiresAt', expiresAt.toString());

    setAuthState({
      token,
      userInfo,
      expiresAt,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('expiresAt');
    setAuthState(UNAUTHORIZED);
    history.push('/');
  };

  const isAuthenticated = () => {
    if (!authState.token || !authState.expiresAt) {
      return false;
    }
    return new Date().getTime() / 1000 < authState.expiresAt;
  };

  const isAdmin = () => {
    return authState.userInfo?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        authInfo: authState,
        setAuthInfo: authInfo => setAuthInfo(authInfo),
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export {useAuth, AuthProvider};
