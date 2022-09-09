import React, {ReactNode, createContext, useState, useContext, useEffect} from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
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
  isAuthenticated: () => false,
});

const AuthProvider = ({children}: {children: ReactNode}) => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'userInfo', 'expiresAt']);

  const token = cookies.token;
  let userInfo = cookies.userInfo;
  const expiresAt = cookies.expiresAt;

  const [authState, setAuthState] = useState<AuthInfo>({
    token: token || null,
    expiresAt: expiresAt ? Number(expiresAt) : null,
    userInfo: userInfo || null
  });

  const setAuthInfo = ({token, userInfo, expiresAt}: AuthInfo) => {
    token && setCookie('token', token);
    userInfo && setCookie('userInfo', JSON.stringify(userInfo));
    expiresAt && setCookie('expiresAt', expiresAt.toString());

    setAuthState({token, userInfo, expiresAt})
  };

  const logout = () => {
    removeCookie('token');
    removeCookie('userInfo');
    removeCookie('expiresAt');
    setAuthState(UNAUTHORIZED);
    router.push('/');
  };

  const isAuthenticated = () => {
    if (!token || !expiresAt) {
      return false;
    }
    return new Date().getTime() / 1000 < expiresAt;
  };

  return (
    <AuthContext.Provider
      value={{
        authInfo: { token, userInfo, expiresAt },
        setAuthInfo: authInfo => setAuthInfo(authInfo),
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export {useAuth, AuthProvider};
