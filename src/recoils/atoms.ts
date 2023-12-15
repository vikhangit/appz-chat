import { recoilPersist } from 'recoil-persist'
import {atom} from 'recoil';

const { persistAtom } = recoilPersist()

export const adminAtom = atom({
  key: 'admin',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const tenantAtom = atom({
  key: 'tenant',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const localeAtom = atom({
  key: 'locale',
  default: null,
  effects_UNSTABLE: [persistAtom],
});




