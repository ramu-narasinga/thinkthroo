// types/umami.d.ts
export {};

declare global {
  interface Window {
    umami?: (event: string, data?: any) => void;
  }
}