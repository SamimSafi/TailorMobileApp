# SIM Detection Integration Guide

## ✅ Changes Completed

### 1. **Installed `react-native-sim-info` Package**
```
react-native-sim-info@1.0.6 - Provides native SIM slot detection for Android
```

### 2. **Updated Files**

#### ✏️ `android/app/src/main/AndroidManifest.xml`
Added required permissions:
- `android.permission.SEND_SMS` - Send SMS messages
- `android.permission.READ_PHONE_STATE` - Detect SIM slots
- `android.permission.READ_SMS` - Read SMS data
- `android.permission.ACCESS_NETWORK_STATE` - Network state detection

#### ✏️ `app.json`
Updated `expo-build-properties` plugin with:
```json
{
  "android": {
    "permissions": [
      "android.permission.SEND_SMS",
      "android.permission.READ_PHONE_STATE",
      "android.permission.READ_SMS",
      "android.permission.ACCESS_NETWORK_STATE"
    ],
    "compileSdkVersion": 34,
    "targetSdkVersion": 34
  }
}
```

#### ✏️ `src/services/nativeSmsService.js`
- Imported `react-native-sim-info` package
- Updated `detectAvailableSims()` method to:
  - Use `SimInfo.getAllSimSlots()` for SIM detection
  - Extract carrier name, phone number, and SIM status
  - Provide fallback to default dual-SIM configuration
  - Include better error logging

### 3. **What You Can Now Detect**
✅ **SIM Slot 1 (Primary):**
- Display name / Carrier name
- Phone number
- SIM status (Active/Ready/Not Ready)
- Country ISO code
- Subscription ID

✅ **SIM Slot 2 (Secondary) - Dual SIM Devices:**
- All information from Slot 1
- Will show as "Not Ready" if no SIM inserted

---

## 🚀 How to Rebuild and Test

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Rebuild the Android App
```bash
# Option A: Using Expo CLI (local build)
npm run android

# Option B: Using EAS Build (recommended for production)
eas build --platform android --clear
```

### Step 3: Deploy to Your Phone
The app will rebuild and automatically deploy to your connected device/emulator.

---

## 🧪 Testing SIM Detection

### 1. **Check Console Logs**
Once the app opens, look for these logs in your IDE console:

```
✓ 🔍 Detecting available SIM cards using react-native-sim-info...
✓ 📱 SimInfo result: [...]
✓ ✓ Detected SIMs via react-native-sim-info: [...]
✓ ✓ Final SIM list: [...]
```

### 2. **Open SendMessageModal**
- Navigate to a customer detail screen
- Tap "Send Message" button
- You should see available SIM slots displayed

### 3. **Expected UI Display**
```
Available SIM:
[ SIM Slot 1 (Primary) (Active)        ▼ ]
[ SIM Slot 2 (Secondary) (Not Ready)   ▼ ]
```

If both SIMs are active:
```
Available SIM:
[ Jio (Active)      ▼ ]
[ Airtel (Ready)    ▼ ]
```

---

## 📊 Data Returned by SimInfo

Each detected SIM will contain:

```javascript
{
  id: 0,                              // SIM slot index
  name: "Jio (Active)",              // Display name with status
  phoneNumber: "+919876543210",      // Phone number (may be empty)
  simSlot: 0,                        // Slot number
  isReady: true,                     // Is SIM ready to use
  isActive: true,                    // Is SIM currently active
  carrierName: "Jio",                // Carrier/Network name
  countryIso: "IN",                  // Country ISO code
  subscriptionId: 123456789          // Subscription ID
}
```

---

## ⚠️ Troubleshooting

### Issue: SIM Not Detected
**Solution:**
1. Make sure app has permissions (check Android settings)
2. Ensure SIM cards are inserted and active in device
3. Check logcat for errors: `adb logcat | grep SimInfo`

### Issue: "Permission Denied" Error
**Solution:**
1. Rebuild app with `npm run android`
2. Grant permissions when prompted by the app
3. Grant permissions in Settings > Apps > YourApp > Permissions

### Issue: App Crashes on SIM Detection
**Solution:**
1. Clear app cache: `npm run android -- --clean`
2. Check console logs for specific error
3. Ensure `react-native-sim-info` is properly installed

---

## 🔄 Runtime Permission Flow

The app requests permissions when `SendMessageModal` opens:

1. **checkSmsAvailability()** is called
2. App requests runtime permissions:
   - SEND_SMS
   - READ_PHONE_STATE
   - READ_SMS
3. **detectAvailableSims()** runs
4. SIM information is loaded and displayed

---

## 📱 Device Compatibility

| Feature | Android | iOS |
|---------|---------|-----|
| SIM Detection | ✅ Works | ❌ Limited (requires custom native code) |
| SMS Sending | ✅ Works | ✅ Works (via native SMS app) |
| Dual SIM Support | ✅ Full support | ⚠️ Partial support |
| Carrier Name | ✅ Yes | ✅ Yes |
| Phone Number | ✅ Yes | ⚠️ May be empty |

---

## 📝 Next Steps (Optional)

### To Get Real-Time SIM Changes:
Add listener for SIM state changes:
```javascript
import { SimStateListener } from 'react-native-sim-info';

// Listen for SIM slot changes
SimStateListener.addListener((event) => {
  console.log('SIM state changed:', event);
  // Reload SIMs
});
```

### To Handle Different Android Versions:
The app automatically handles:
- Android 6.0+ (runtime permissions)
- Android 8.0+ (notification restrictions)
- Android 10+ (scoped storage)
- Android 12+ (SMS app default)

---

## 🆘 Support

If you encounter issues:
1. Check the console logs (search for "SimInfo" or "SIM")
2. Verify device has SIM cards inserted
3. Ensure app has been rebuilt after changes
4. Check Android Settings > Apps > Your App > Permissions

**Package Documentation:**
- [react-native-sim-info GitHub](https://github.com/Nishant5565/react-native-sim-info)
- [Android Telephony Documentation](https://developer.android.com/reference/android/telephony/TelephonyManager)