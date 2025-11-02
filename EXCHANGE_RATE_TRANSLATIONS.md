# Exchange Rate UI - Translation Keys

## Required Translation Keys

Add these keys to your i18n translation files for the enhanced exchange rate UI.

### English Translation Keys

```json
{
  "equivalent_in_cdf": "Equivalent in CDF",
  "original_rate": "Original Rate",
  "exchange_rate": "Exchange Rate",
  "failed_to_fetch_exchange_rates": "Failed to fetch exchange rates. Please try again."
}
```

### French Translation Keys

```json
{
  "equivalent_in_cdf": "Équivalent en CDF",
  "original_rate": "Taux Original",
  "exchange_rate": "Taux de Change",
  "failed_to_fetch_exchange_rates": "Échec de la récupération des taux de change. Veuillez réessayer."
}
```

## File Locations

Add these translations to your i18n files:

- English: `public/locales/en/translation.json`
- French: `public/locales/fr/translation.json`

Or wherever your translation files are located in your project structure.

## Notes

- All keys use snake_case naming convention
- Keys are descriptive and self-documenting
- French translations maintain formal tone ("vous" form)
- Special characters (é, è, ê, etc.) properly encoded in French
