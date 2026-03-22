/**
 * USE_ADB_REVERSE_API = true (default): phone calls http://127.0.0.1:5000 on the device;
 * USB debugging forwards it to your PC — works even on 4G (no Wi‑Fi to PC needed).
 * Before running the app, run: adb reverse tcp:5000 tcp:5000
 *
 * Set USE_ADB_REVERSE_API = false only if phone and PC are on the same Wi‑Fi and set
 * API_BASE_URL to your PC IPv4 from ipconfig. Open Windows Firewall port 5000 if needed.
 */
export const API_BASE_URL = 'http://10.81.211.217:5000';

/** true = USB + adb reverse (recommended). false = LAN IP above. */
export const USE_ADB_REVERSE_API = true;
