import {createContext, useCallback, useContext, useState, type ReactNode} from 'react';
import {Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from '@monoline/react';

interface Item {id: number; title: string; description?: string}
const Ctx = createContext<(title: string, description?: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

/** The kit's Toast is controlled only (no toast() function), so this is the queue every app has to write. */
export function Toasts({children}: {children: ReactNode}) {
  const [items, setItems] = useState<Item[]>([]);
  const push = useCallback((title: string, description?: string) => setItems((l) => [...l, {id: Date.now() + Math.random(), title, description}]), []);
  return (
    <Ctx.Provider value={push}>
      <ToastProvider duration={4000} label="Notifications">
        {children}
        {items.map((t) => (
          <Toast key={t.id} onOpenChange={(o) => !o && setItems((l) => l.filter((x) => x.id !== t.id))}>
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport label="Notifications" />
      </ToastProvider>
    </Ctx.Provider>
  );
}
