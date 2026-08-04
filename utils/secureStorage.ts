import * as Keychain from 'react-native-keychain';

// Each logical key gets its own Keychain entry via a distinct `service`
// name — react-native-keychain's generic password API stores one
// credential per service, so a single shared service would let a second
// setSecureItem() call silently overwrite an unrelated key.
const SERVICE_PREFIX = 'com.acewallscholarsindep.secure';

const serviceFor = (key: string): string => `${SERVICE_PREFIX}.${key}`;

export const setSecureItem = async (
  key: string,
  value: string
): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(key, value, { service: serviceFor(key) });
    return true;
  } catch (error) {
    console.error(`Error saving secure item [${key}]:`, error);
    return false;
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: serviceFor(key) });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error(`Error retrieving secure item [${key}]:`, error);
    return null;
  }
};

export const removeSecureItem = async (key: string): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({ service: serviceFor(key) });
    return true;
  } catch (error) {
    console.error(`Error removing secure item [${key}]:`, error);
    return false;
  }
};
