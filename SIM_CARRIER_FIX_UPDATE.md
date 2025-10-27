# SIM Carrier Name & Phone Number Fix - ROOT CAUSE ANALYSIS

## Problem
You were seeing **"Unknown Carrier"** and **"no number assigned"** even though `react-native-simcard-info` package has all the data.

## Root Cause Found ❌
The issue was in **nativeSmsService.js** - the code was looking for the **wrong field names**!

According to the GitHub documentation for `react-native-simcard-info`:
```json
{
  "carrierName": "Jio",        // ✅ Use this for carrier name
  "number": "+911234567890",   // ✅ Use this for phone number (NOT phoneNumber)
  "displayName": "SIM"
}
```

But the code was checking for:
```javascript
sim.phoneNumber  // ❌ WRONG - doesn't exist in react-native-simcard-info
```

Should be:
```javascript
sim.number       // ✅ CORRECT - this is the actual field name
```

## Fixes Applied ✅

### 1. **nativeSmsService.js - Line 131** (Primary Method)
**Before:**
```javascript
const phoneNumber = phoneNumbers?.[index] || sim.phoneNumber || '';
```

**After:**
```javascript
const phoneNumber = phoneNumbers?.[index] || sim.number || sim.phoneNumber || '';
```

Also reprioritized display name to show **carrierName first**:
```javascript
const displayName = sim.carrierName || sim.displayName || sim.simOperatorName || `SIM ${index + 1}`;
```

### 2. **nativeSmsService.js - Line 178** (Secondary Fallback)
Added `sim.number` to fallback chain for react-native-sim-info:
```javascript
phoneNumber: sim.phoneNumber || sim.number || sim.phone || ''
```

### 3. **nativeSmsService.js - Line 208** (Tertiary Fallback)
Prioritized `carrierName` for SmsModule:
```javascript
const displayName = sim.carrierName || sim.displayName || sim.displayname || `SIM Slot ${index + 1}`;
```

## What This Fixes 🎯

✅ **Phone numbers will now display** - By checking `sim.number` (correct field name)  
✅ **Carrier names will show properly** - "Jio", "Vodafone", "Airtel", etc. instead of "Unknown Carrier"  
✅ **All three fallback methods consistent** - All prioritize `carrierName` and check all field variations  
✅ **Better debugging logs** - Added detailed logging of raw field names for troubleshooting  

## Testing

1. Run the app on a dual-SIM Android device
2. Open SendMessageModal or SmsExample
3. Check SIM selection - should now show:
   - **Carrier name** (Jio, Vodafone, etc.) ← Previously showed "SIM Slot 1"
   - **Phone number** (+91...) ← Previously showed "No number assigned"
4. Check console logs for SIM mapping details

## Data Flow Verification

```
react-native-simcard-info
    ↓
Returns: { carrierName: "Jio", number: "+911234567890", ... }
    ↓
nativeSmsService.detectAvailableSims()
    ↓
Maps to: { carrierName: "Jio", phoneNumber: "+911234567890", ... }
    ↓
SendMessageModal.loadAvailableSims()
    ↓
Displays: Carrier: "Jio" | Phone: "+911234567890"
```

## Files Modified
- `src/services/nativeSmsService.js` - Fixed field name mappings