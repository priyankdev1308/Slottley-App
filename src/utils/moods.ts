export type Mood = {
    id: string;
    emoji: string;
    label: string;
};

export const moods: Mood[] = [
    { id: 'missing', emoji: '💙', label: 'Missing you' },
    { id: 'hopeful', emoji: '🌼', label: 'Hopeful' },
    { id: 'sad', emoji: '🕊️', label: 'Sad' },
    { id: 'love', emoji: '❤️', label: 'Love' },
    { id: 'anger', emoji: '🔥', label: 'Anger' },
    { id: 'thankful', emoji: '🌿', label: 'Thankful' },
    { id: 'afraid', emoji: '🟣', label: 'Afraid' },
    { id: 'peace', emoji: '☁️', label: 'Peace' },
];

export const getMood = (id?: string | null): Mood | undefined =>
    moods.find(m => m.id === id);
