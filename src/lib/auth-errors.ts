import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists for this email.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/wrong-password": "Incorrect password. Try again.",
  "auth/user-not-found": "No account found for this email.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
