import {AxiosInstance} from 'axios';
import {SignupInfo} from '../models';
import {AuthInfo} from '../context/AuthContext';
import {PublicApi} from '../api';

export const getPublicEndpoints = (api: AxiosInstance): PublicApi => ({
  signup: signup(api),
  login: login(api),
});

const signup = (api: AxiosInstance) => (info: SignupInfo): Promise<AuthInfo> =>
  api.post('signup/', info).then(authInfo => authInfo.data);

const login = (api: AxiosInstance) => (credentials: {
  email: string;
  password: string;
}): Promise<AuthInfo> =>
  api.post('login/', credentials).then(authInfo => authInfo.data);
