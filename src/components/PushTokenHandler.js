/**
 * Handles FCM push token: register when user is logged in, revoke when no user.
 * Must be mounted for the whole app (not route-specific) so revoke runs when logged out on any screen.
 */
export default function PushTokenHandler() {
  // Web-only mode: native push handler intentionally disabled.
  return null;
}
