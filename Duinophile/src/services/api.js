/**
 * API client — base URL: src/config/apiConfig.js (your PC IPv4 :5000).
 * Keeps multipart uploads working and avoids console.error (Red Box).
 */
import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import {
  API_BASE_URL as CONFIG_API_BASE_URL,
  USE_ADB_REVERSE_API,
} from '../config/apiConfig';

const PORT = 5000;
const DEVICE_BASE_URL = '';

const devHost = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

function hostFromMetroBundle() {
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (!scriptURL || typeof scriptURL !== 'string') return null;
    if (scriptURL.startsWith('file:') || scriptURL.startsWith('asset:')) {
      return null;
    }
    let parsed;
    try {
      parsed = new URL(scriptURL);
    } catch {
      const m = scriptURL.match(/^https?:\/\/([^/:?]+)/);
      if (!m) return null;
      parsed = { hostname: m[1] };
    }
    let host =
      parsed instanceof URL
        ? parsed.hostname
        : parsed.hostname || (parsed.host || '').split(':')[0];
    if (!host) return null;
    if (
      Platform.OS === 'android' &&
      (host === 'localhost' || host === '127.0.0.1')
    ) {
      host = '10.0.2.2';
    }
    return host;
  } catch {
    return null;
  }
}

function normalizeApiBaseUrl(input) {
  const s = (input || '').trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return s.replace(/\/$/, '');
  }
  const ipv4 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?$/;
  const m = s.match(ipv4);
  if (m) {
    const port = m[2] ? m[2] : String(PORT);
    return `http://${m[1]}:${port}`;
  }
  return `http://${s}`;
}

const BASE_URL = (() => {
  const fromConfig = normalizeApiBaseUrl(CONFIG_API_BASE_URL);
  if (fromConfig) return fromConfig;

  const fromDevice = normalizeApiBaseUrl(DEVICE_BASE_URL);
  if (fromDevice) return fromDevice;

  const metroHost = hostFromMetroBundle();
  if (metroHost) {
    return `http://${metroHost}:${PORT}`;
  }

  return `http://${devHost}:${PORT}`;
})();

if (__DEV__) {
  console.log('[API] base URL:', BASE_URL);
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function stripContentTypeForMultipart(config) {
  const data = config.data;
  const isMultipart =
    data &&
    ((typeof FormData !== 'undefined' && data instanceof FormData) ||
      Array.isArray(data._parts));

  if (!isMultipart) return;

  const h = config.headers;
  if (h?.delete) {
    h.delete('Content-Type');
    h.delete('content-type');
  } else {
    delete h['Content-Type'];
    delete h['content-type'];
  }
}

api.interceptors.request.use(
  config => {
    stripContentTypeForMultipart(config);
    if (__DEV__) {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      );
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response.data,
  error => {
    const base = api.defaults.baseURL || '';
    let message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = `Request timed out. For large photos, try a smaller image. API: ${base}`;
    } else if (
      !error.response &&
      (error.message === 'Network Error' || error.code === 'ERR_NETWORK')
    ) {
      const isEmulatorHost = base.includes('10.0.2.2');
      message =
        `Cannot reach the API at ${base}. ` +
        `On your PC: cd DuinophileBackend && npm start (MongoDB must be running). ` +
        (isEmulatorHost
          ? 'On a real phone: set API_BASE_URL in src/config/apiConfig.js to your PC IPv4 from ipconfig. '
          : 'If IP changed, update apiConfig.js. ') +
        'Same Wi‑Fi as PC, or USB + adb reverse + USE_ADB_REVERSE_API in apiConfig. ' +
        'Allow port 5000 in Windows Firewall.';
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
