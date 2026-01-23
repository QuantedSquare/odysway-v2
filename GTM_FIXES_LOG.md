# GTM Tracking Implementation - Fixes Log

## Fix #1: Correct `optin_newsletter` Structure (2026-01-22)

### Issue
The `optin_newsletter` field was incorrectly placed inside the `user_data` object instead of at the root level of the dataLayer event, which doesn't match the CSV tagging plan structure.

### CSV Requirement
Per the CSV (lines 351-377, 406-432, 461-487, 516-542, 1073-1099), the structure should be:

```javascript
dataLayer.push({
    'event': 'reservation_step2', // or step3, step4, step5, devis_classic_confirmation
    'optin_newsletter': 'true / false', // ← At root level
    'user_data': {
        'user_mail': '...',
        'user_phone': '...',
        // other user fields
    },
    'ecommerce': { ... }
})
```

### What Was Wrong

**Before (Incorrect)**:
```javascript
const userData = {
  email: model.value.email,
  phone: model.value.phone,
  optin_newsletter: model.value.optinNewsletter, // ← Inside userData
}
trackReservationStep(2, formattedVoyage, userData)
```

This resulted in:
```javascript
{
  event: 'reservation_step2',
  user_data: {
    email: '...',
    phone: '...',
    optin_newsletter: true // ← Wrong location!
  },
  ecommerce: { ... }
}
```

**After (Correct)**:
```javascript
const additionalData = {
  optin_newsletter: model.value.optinNewsletter, // ← At root level
  user_data: {
    email: model.value.email,
    phone: model.value.phone,
  },
}
trackReservationStep(2, formattedVoyage, additionalData)
```

This produces:
```javascript
{
  event: 'reservation_step2',
  optin_newsletter: true, // ← Correct location!
  user_data: {
    email: '...',
    phone: '...',
  },
  ecommerce: { ... }
}
```

### Files Modified

1. **`app/composables/useGtmTracking.js`**
   - Changed `trackReservationStep` parameter from `userData` to `additionalData`
   - Updated to use `Object.assign()` to merge additional data at root level
   - Updated JSDoc comments

2. **`app/components/Funnel/Steps/Details.vue`** (Step 2)
   - Fixed structure: `optin_newsletter` at root, `user_data` separate

3. **`app/components/Funnel/Steps/TravelersInfos.vue`** (Step 3)
   - Added `optin_newsletter` at root level
   - Added `user_data` with email and phone

4. **`app/components/Funnel/Steps/Options.vue`** (Step 4)
   - Added `optin_newsletter` at root level
   - Moved `indiv_room` into `user_data`
   - Added email and phone to `user_data`

5. **`app/components/Funnel/Steps/Insurances.vue`** (Step 5)
   - Added `optin_newsletter` at root level
   - Moved `insurance_type` into `user_data`
   - Added email and phone to `user_data`

6. **`app/pages/devis/index.vue`** (Devis Classic Confirmation)
   - Fixed structure: `optin_newsletter` at root, `user_data` separate

### Impact

- **Checkout Funnel**: Steps 2, 3, 4, 5 now correctly include `optin_newsletter` at root level
- **Devis Funnel**: Classic confirmation now correctly includes `optin_newsletter` at root level
- **Data Structure**: All events now match the CSV specification exactly

### Testing Checklist

- [ ] Verify `reservation_step2` has `optin_newsletter` at root level
- [ ] Verify `reservation_step3` has `optin_newsletter` at root level
- [ ] Verify `reservation_step4` has `optin_newsletter` at root level
- [ ] Verify `reservation_step5` has `optin_newsletter` at root level
- [ ] Verify `devis_classic_confirmation` has `optin_newsletter` at root level
- [ ] Verify `user_data` object structure is correct in all events
- [ ] Test with both optin checked (true) and unchecked (false)

---

## Additional Notes

---

## Fix #2: Add `user_country` Field (2026-01-22)

### Issue
The `user_country` field was missing from `user_data` objects in all funnel steps, even though it's specified in the CSV tagging plan.

### CSV Requirement
Per the CSV, all steps with `user_data` should include `user_country` derived from the phone number's country code:

```javascript
'user_data': {
    'user_mail': '...',
    'user_phone': '+33612345678',
    'user_country': 'France' // ← Derived from +33
}
```

### Solution

**Created Utility Function** in `useGtmTracking.js`:
```javascript
const getCountryFromPhone = (phone) => {
  if (!phone) return null
  
  const countryMap = {
    '+33': 'France',
    '+32': 'Belgium',
    '+1': 'Canada/USA',
    // ... 10 countries total
  }
  
  for (const [code, country] of Object.entries(countryMap)) {
    if (phone.startsWith(code)) {
      return country
    }
  }
  
  return null
}
```

### Files Modified (6 files)

1. ✅ `app/composables/useGtmTracking.js` - Added `getCountryFromPhone()` utility
2. ✅ `app/components/Funnel/Steps/Details.vue` - Step 2
3. ✅ `app/components/Funnel/Steps/TravelersInfos.vue` - Step 3
4. ✅ `app/components/Funnel/Steps/Options.vue` - Step 4
5. ✅ `app/components/Funnel/Steps/Insurances.vue` - Step 5
6. ✅ `app/pages/devis/index.vue` - Devis classic confirmation

### Impact

- ✅ All checkout steps (2-5) now include `user_country`
- ✅ Devis confirmation now includes `user_country`
- ✅ Country automatically derived from phone country code
- ✅ Handles null cases gracefully

---

### Future Improvements Needed

1. **Unused Function**: `trackViewPhotos` is defined but `trackVoirPhotos` is called. Consider renaming for consistency.

2. **Additional User Data**: Could potentially include `user_id` if user is logged in/identified.
   
3. **Data Validation**: Consider adding validation to ensure `optin_newsletter` is always a boolean string ('true'/'false') as per CSV spec.

4. **Country Code Coverage**: Current map covers 10 countries matching the phone component.

### CSV References

- Reservation Step 2: Lines 351-377
- Reservation Step 3: Lines 406-432
- Reservation Step 4: Lines 461-487
- Reservation Step 5: Lines 516-542
- Devis Classic Confirmation: Lines 1073-1099
