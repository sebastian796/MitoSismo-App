export type Quake = {
  id: number;
  mag: number;
  place: string;
  depth: number;
  time: string;
  country: string;
  lat: number;
  lng: number;
  coords: string;
  fullDate: string;
};

export type Mission = {
  id: number;
  title: string;
  description: string;
  progress: number;
  xp: number;
  completed: boolean;
  icon: string;
};

export type Creature = {
  id: string;
  name: string;
  title: string;
  element: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  description: string;
  mythLore: string;
  abilities: {
    name: string;
    description: string;
    unlocked: boolean;
  }[];
};

export type EmergencyContact = {
  name: string;
  number: string;
  description: string;
  icon: string;
};
