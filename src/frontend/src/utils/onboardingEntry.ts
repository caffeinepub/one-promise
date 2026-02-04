/**
 * Utility to manage onboarding entry behavior.
 * Controls whether to show the logged-out landing screen or start directly at the carousel.
 */

const POST_LOGOUT_FLAG_KEY = 'one-promise-post-logout';

/**
 * Set flag to show logged-out screen after logout.
 * This flag is consumed once and then cleared.
 */
export function setPostLogoutFlag(): void {
  try {
    sessionStorage.setItem(POST_LOGOUT_FLAG_KEY, 'true');
  } catch (error) {
    console.error('Failed to set post-logout flag:', error);
  }
}

/**
 * Check if we should show the logged-out screen.
 * Returns true only immediately after logout, then clears the flag.
 */
export function consumePostLogoutFlag(): boolean {
  try {
    const flag = sessionStorage.getItem(POST_LOGOUT_FLAG_KEY);
    if (flag === 'true') {
      sessionStorage.removeItem(POST_LOGOUT_FLAG_KEY);
      return true;
    }
  } catch (error) {
    console.error('Failed to read post-logout flag:', error);
  }
  return false;
}
