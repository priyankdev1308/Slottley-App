import { getAsyncStorage, setAsyncStorage } from '../helpers/globalFunctions';
import { localStore } from './constants';

export type StoredUser = {
  user_id?: number;
  name?: string;
  email?: string;
  country_code?: string;
  phone_number?: string;
  dob?: string;
  gender?: string;
  [key: string]: any;
};

export const setStoredUser = async (user: StoredUser) => {
  await setAsyncStorage(localStore.userData, JSON.stringify(user));
};

export const getStoredUser = async (): Promise<StoredUser | null> => {
  const raw = await getAsyncStorage(localStore.userData);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
