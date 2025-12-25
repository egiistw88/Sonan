// Manual type definitions to replace missing vite/client and vite-plugin-pwa/client

declare module '*.css' {}
declare module '*.scss' {}
declare module '*.sass' {}
declare module '*.less' {}
declare module '*.styl' {}
declare module '*.stylus' {}
declare module '*.pcss' {}
declare module '*.sss' {}

declare module '*.png' { const src: string; export default src; }
declare module '*.jpg' { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.gif' { const src: string; export default src; }
declare module '*.svg' { const src: string; export default src; }
declare module '*.ico' { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }
declare module '*.avif' { const src: string; export default src; }

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

// Augment import.meta
interface ImportMetaEnv {
  [key: string]: any
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
  SSR: boolean
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
  glob(pattern: string): Record<string, () => Promise<any>>
}
