import React, {ReactNode, createContext, useContext} from 'react';
import {useAuth} from './AuthContext';
import {AuthenticatedApi, getAuthenticatedApi} from '../api';

const ApiContext = createContext<AuthenticatedApi | undefined>(undefined);

const AuthenticatedApiProvider = ({children}: {children: ReactNode}) => {
  const {
    isAuthenticated,
    authInfo: {token},
  } = useAuth();

  const authenticatedApi =
    isAuthenticated() && token ? getAuthenticatedApi(token) : undefined;

  return (
    <ApiContext.Provider value={authenticatedApi}>
      {children}
    </ApiContext.Provider>
  );
};

const useAuthenticatedApi = (): AuthenticatedApi =>
  useContext(ApiContext) as AuthenticatedApi;

export {useAuthenticatedApi, AuthenticatedApiProvider};
