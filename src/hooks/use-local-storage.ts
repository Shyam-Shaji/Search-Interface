import { useCallback, useEffect, useState } from "react";

type SetValue<T> = T | ((prev: T) => T);

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, (value: SetValue<T>) => void, () => void] {
    const readValue = useCallback(():T => {
        if(typeof window === 'undefined') return initialValue;
        try{
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch(error){
            console.warn(`useLocalStorage: Error reading key "${key}"`, error);
            return initialValue;
        }
    },[key, initialValue]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setStoredValue((prev) => {
          const next =
            typeof value === "function" ? (value as (p: T) => T)(prev) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next));
            window.dispatchEvent(
              new StorageEvent("storage", { key, newValue: JSON.stringify(next) }),
            );
          }
          return next;
        });
      } catch (error) {
        console.warn(`useLocalStorage: error setting key "${key}"`, error);
      }
    },
    [key],
  );

  const removeValue = useCallback(()=>{
    try {
        if(typeof window !== 'undefined'){
            window.localStorage.removeItem(key);
        }
        setStoredValue(initialValue);
    } catch (error) {
        console.warn(`useLocalStorage: error removing key "${key}"`,error);
    }
  },[key,initialValue]);

  useEffect(()=>{
    const onStorage = (e: StorageEvent) => {
        if(e.key !== key) return;
        try{
           setStoredValue(e.newValue ? (JSON.parse(e.newValue) as T): initialValue);
        } catch(error){
            console.warn(`useLocalStorage: error parsing key "${key}"`,error);
        }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },[key,initialValue]);

  return [storedValue, setValue, removeValue];
}