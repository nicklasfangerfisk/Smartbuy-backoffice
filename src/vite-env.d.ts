/// <reference types="vite/client" />

// Global variables injected by Vite
declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
