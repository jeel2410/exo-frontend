import { useMemo } from 'react';
import { countries } from '../utils/constant/optimizedCountries';

interface CountryLookupMap {
  byPhoneCode: Map<string, { code: string; name: string }>;
  options: Array<{
    value: string;
    label: string;
    code: string;
    phoneCode: string;
  }>;
}

export const useCountryLookup = (): CountryLookupMap => {
  const lookup = useMemo(() => {
    const byPhoneCode = new Map<string, { code: string; name: string }>();
    const options = countries.map((country) => {
      byPhoneCode.set(country.phoneCode, {
        code: country.code,
        name: country.name,
      });
      return {
        value: country.phoneCode,
        label: country.name,
        code: country.code,
        phoneCode: country.phoneCode,
      };
    });

    return {
      byPhoneCode,
      options,
    };
  }, []);

  return lookup;
};
