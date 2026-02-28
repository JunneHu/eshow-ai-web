import { createStorage } from './storage-cache';
const prefixKey = 'FL--';

export const FLlocalStorageMicroApp = createStorage({
  prefixKey,
  storage: localStorage,
});

export const FLSessionStorage = createStorage({
  prefixKey,
  storage: sessionStorage,
});
