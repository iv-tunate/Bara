export interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  browser: string;
  os: string;
  screenResolution: string;
  timezone: string;
}

export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bTablet\b)/i.test(userAgent);
  
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  if (isTablet) {
    deviceType = 'Tablet';
  } else if (isMobile) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  let os = 'Unknown';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  const screenResolution = `${screen.width}x${screen.height}`;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    userAgent,
    platform,
    deviceType,
    browser,
    os,
    screenResolution,
    timezone
  };
}

export function generateDeviceFingerprint(): string {
  const device = getDeviceInfo();
  return `${device.deviceType} - ${device.browser} on ${device.os}`;
}
