import { useCallback } from 'react';

export interface UmamiEventData {
  [key: string]: string | number | boolean;
}

export const useUmami = () => {
  const track = useCallback((eventName: string, eventData?: UmamiEventData) => {
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track(eventName, eventData);
    }
  }, []);

  return { track };
};
