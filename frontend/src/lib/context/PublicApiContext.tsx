import {createContext, useContext} from 'react';
import {getPublicApi, PublicApi} from '../api';

const PublicApiContext = createContext<PublicApi>(getPublicApi());

const usePublicApi = (): PublicApi => useContext(PublicApiContext);

export {usePublicApi};
