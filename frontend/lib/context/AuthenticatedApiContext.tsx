import React, {ReactNode, createContext, useContext} from 'react';
import {useAuth} from './AuthContext';
import {AuthenticatedApi, getAuthenticatedApi} from '../api';

const ApiContext = createContext<AuthenticatedApi | undefined>(undefined);

export const AuthenticatedApiProvider = ({children}: {children: ReactNode}) => {
  const {
    isAuthenticated,
    authInfo: {token},
  } = useAuth();

  const authenticatedApi =
    isAuthenticated() && token ? getAuthenticatedApi(token) : undefined;

  console.log(isAuthenticated());

  return (
    <ApiContext.Provider value={authenticatedApi}>
      {children}
    </ApiContext.Provider>
  );
};

export const useAuthenticatedApi = (): AuthenticatedApi =>
  useContext(ApiContext) as AuthenticatedApi;
