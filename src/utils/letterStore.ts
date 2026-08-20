import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Letter = {
    id: string;
    title: string;
    body: string;
    mood: string | null;
    date: string;
};

const STORAGE_KEY = '@DearChild/letters';

let _letters: Letter[] = [];
let _hydrated = false;
const _subscribers = new Set<() => void>();

const notify = () => _subscribers.forEach(cb => cb());

const persist = () => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_letters)).catch(() => { });
};

const hydrate = async () => {
    if (_hydrated) return;
    _hydrated = true;
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                _letters = parsed;
                notify();
            }
        }
    } catch {
        // ignore corrupt storage
    }
};

export const addLetter = (input: Omit<Letter, 'id' | 'date'>) => {
    _letters = [
        {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            date: new Date().toISOString(),
            ...input,
        },
        ..._letters,
    ];
    persist();
    notify();
};

export const updateLetter = (
    id: string,
    fields: Partial<Omit<Letter, 'id' | 'date'>>,
) => {
    let changed = false;
    _letters = _letters.map(l => {
        if (l.id !== id) return l;
        changed = true;
        return { ...l, ...fields };
    });
    if (changed) {
        persist();
        notify();
    }
};

export const removeLetter = (id: string) => {
    const next = _letters.filter(l => l.id !== id);
    if (next.length === _letters.length) return;
    _letters = next;
    persist();
    notify();
};

export const getLetter = (id: string) => _letters.find(l => l.id === id);

export const useLetters = () => {
    const [letters, setLetters] = useState<Letter[]>(_letters);
    useEffect(() => {
        const cb = () => setLetters([..._letters]);
        _subscribers.add(cb);
        hydrate();
        return () => {
            _subscribers.delete(cb);
        };
    }, []);
    return letters;
};
