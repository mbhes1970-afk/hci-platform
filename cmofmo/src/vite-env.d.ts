/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAND: 'hci';
  readonly VITE_POCKETBASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __sm?: {
    getState: () => Record<string, unknown>;
    forceShow: () => void;
    selectICP: (icp: string) => void;
    selectSector: (sector: string) => void;
    addIntent?: (points: number) => void;
    addFit?: (points: number) => void;
  };
}
