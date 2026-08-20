import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@DearChild/childName';

let _name = '';
let _hydrated = false;
const _subscribers = new Set<() => void>();

const notify = () => _subscribers.forEach(cb => cb());

const hydrate = async () => {
    if (_hydrated) return;
    _hydrated = true;
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        // If setName was already called in this session, don't overwrite it
        // with a stale value from storage.
        if (typeof raw === 'string' && !_name) {
            _name = raw;
            notify();
        }
    } catch {
        // ignore
    }
};

export const getName = () => _name;

export const setName = (next: string) => {
    const trimmed = next.trim();
    if (trimmed === _name) return;
    _name = trimmed;
    AsyncStorage.setItem(STORAGE_KEY, _name).catch(() => {});
    notify();
};

export const useName = (initial?: string) => {
    const [name, setLocal] = useState<string>(_name || initial?.trim() || '');

    useEffect(() => {
        const cb = () => setLocal(_name);
        _subscribers.add(cb);
        hydrate();
        if (!_name && initial?.trim()) {
            setName(initial);
        }
        return () => {
            _subscribers.delete(cb);
        };
    }, [initial]);

    return name;
};
