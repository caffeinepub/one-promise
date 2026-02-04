const PERMISSION_REQUESTED_KEY = 'notificationPermissionRequested';

/**
 * Checks if a notification permission request should be attempted.
 * Returns true if Notifications are supported, permission is 'default', and no prior attempt was recorded.
 */
function shouldAttemptRequest(): boolean {
  if (!('Notification' in window)) {
    return false;
  }

  const alreadyRequested = localStorage.getItem(PERMISSION_REQUESTED_KEY);
  if (alreadyRequested === 'true') {
    return false;
  }

  const currentPermission = Notification.permission;
  if (currentPermission !== 'default') {
    // Permission already granted or denied; mark as satisfied
    localStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');
    return false;
  }

  return true;
}

/**
 * Attempts to request browser notification permission in a user-gesture context.
 * Only sets the localStorage guard flag if the request completes successfully (resolved).
 * If the request throws/rejects (e.g., due to gesture requirements), the guard is NOT set,
 * allowing a retry on the next eligible user interaction.
 */
export async function attemptNotificationPermissionRequest(): Promise<void> {
  if (!shouldAttemptRequest()) {
    return;
  }

  try {
    console.log('[Notifications] Requesting permission in gesture context...');
    const result = await Notification.requestPermission();
    console.log(`[Notifications] Permission result: ${result}`);
    
    // Only set the guard flag after a successful request completion
    localStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');
  } catch (error) {
    // If requestPermission throws (e.g., not in a valid gesture context on some platforms),
    // do NOT set the guard flag so we can retry on the next user interaction
    console.warn('[Notifications] Permission request failed (likely gesture requirement):', error);
  }
}

/**
 * Clears the localStorage guard flag (useful for testing).
 * After calling this, the next Today mount will attempt to request permission again.
 */
export function resetNotificationPermissionFlag(): void {
  localStorage.removeItem(PERMISSION_REQUESTED_KEY);
  console.log('[Notifications] Permission request flag cleared');
}
