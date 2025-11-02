# Contract Exchange Rate Translations

## New Translation Key Required

Add this translation key to your language files:

### English
```json
{
  "project_rate": "Project Rate"
}
```

### French
```json
{
  "project_rate": "Taux du Projet"
}
```

## Existing Keys Used

The following existing translation keys are reused from the project exchange rate feature:
- `equivalent_in_cdf` - "Equivalent in CDF" / "Équivalent en CDF"
- `exchange_rate` - "Exchange Rate" / "Taux de Change"

## Implementation Summary

### Contract Creation/Edit Form
- Displays CDF equivalent amount below the amount input
- Uses project's exchange rate (not fetching from API)
- Shows "Project Rate" badge to indicate using project's rate
- Only displays when currency is NOT CDF

### Contract Details View
- Shows CDF equivalent amount next to contract amount
- Displays exchange rate used for the conversion
- Format: `≈ CDF 285,000.00 (Rate: 1 USD = 2850.00 CDF)`
- Only displays when currency is NOT CDF

### Backend Fields
The following fields are now sent to the backend when creating/editing contracts:
- `amount_cdf` - The contract amount converted to CDF
- `exchange_rate_used` - The exchange rate used for conversion (from project)

## Files Modified

1. **ContractInfoForm.tsx**
   - Added `projectExchangeRate` and `projectCurrency` props
   - Added CDF equivalent display with project rate badge

2. **ContractCreatePage.tsx**
   - Fetches project's `exchange_rate_used` from project details
   - Passes exchange rate to ContractInfoForm
   - Updates `createContractPayload` to calculate and include CDF amount

3. **ContractDetails.tsx**
   - Added CDF equivalent display in contract amount section
   - Added `amount_cdf` and `exchange_rate_used` to ContractProps interface

## Key Features

✅ **No API calls for exchange rates** - Uses project's stored exchange rate  
✅ **Consistent rates** - All contracts use the same rate as their parent project  
✅ **Visual clarity** - Shows "Project Rate" badge to indicate source  
✅ **Conditional display** - Only shows for non-CDF currencies  
✅ **Format consistency** - Same display format as project exchange rates  

## Example Display

### In Form (Create/Edit):
```
┌─────────────────────────────────────────┐
│ Contract Amount *                        │
│ ┌───────────────────────────────────┐  │
│ │ USD 50,000.00                     │  │
│ │                                    │  │
│ │ ─────────────────────────────────  │  │
│ │                                    │  │
│ │ EQUIVALENT IN CDF    [Project Rate]│  │
│ │                                    │  │
│ │ CDF 142 500.00                    │  │
│ │                                    │  │
│ │ Exchange Rate: 1 USD = 2850.00 CDF│  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### In Details View:
```
Contract Amount:    USD 50,000.00
                    ≈ CDF 142,500.00 (Rate: 1 USD = 2850.00 CDF)
```
