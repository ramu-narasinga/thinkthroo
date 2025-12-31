import { useCallback } from 'react';

interface EventData {
  [key: string]: string | number | boolean;
}

/**
 * Custom hook for tracking events with Umami analytics
 * @see https://umami.is/docs/tracker-functions
 */
export const useUmamiTracking = () => {
  /**
   * Track a custom event
   * @param eventName - Name of the event to track
   * @param eventData - Optional data to send with the event
   */
  const trackEvent = useCallback((eventName: string, eventData?: EventData) => {
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track(eventName, eventData);
    }
  }, []);

  /**
   * Identify a user (for user-specific tracking)
   * @param userId - Unique identifier for the user
   */
  const identifyUser = useCallback((userId: string) => {
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.identify({ userId });
    }
  }, []);

  return { trackEvent, identifyUser };
};

// // Declare umami on window object for TypeScript
// declare global {
//   interface Window {
//     umami?: {
//       trackEvent: (eventName: string, eventData?: EventData) => void;
//       identifyUser: (data: { userId: string }) => void;
//     };
//   }
// }
