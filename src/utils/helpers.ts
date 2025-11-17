import { Position, Player } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getPositionLabel(position: Position): string {
  const labels: Record<Position, string> = {
    GK: 'Goalkeeper',
    CB: 'Center Back',
    LB: 'Left Back',
    RB: 'Right Back',
    LWB: 'Left Wing Back',
    RWB: 'Right Wing Back',
    CDM: 'Defensive Midfielder',
    CM: 'Central Midfielder',
    CAM: 'Attacking Midfielder',
    LM: 'Left Midfielder',
    RM: 'Right Midfielder',
    LW: 'Left Winger',
    RW: 'Right Winger',
    ST: 'Striker',
    CF: 'Center Forward',
  };
  return labels[position] || position;
}

export function getPositionColor(position: Position): string {
  if (position === 'GK') return 'bg-yellow-500';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'bg-blue-500';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-green-500';
  if (['LW', 'RW', 'ST', 'CF'].includes(position)) return 'bg-red-500';
  return 'bg-gray-500';
}

export function formatMinutes(minutes: number): string {
  return `${minutes}'`;
}

export function getPlayerStatusColor(player: Player): string {
  if (player.notes?.isInjured || player.status === 'injured') return 'text-red-600';
  if (player.status === 'suspended') return 'text-orange-600';
  if (player.notes?.minutesLimit && player.minutesPlayed >= player.notes.minutesLimit) {
    return 'text-yellow-600';
  }
  return 'text-green-600';
}

export function getPlayerStatusBadge(player: Player): string {
  if (player.notes?.isInjured || player.status === 'injured') return 'Injured';
  if (player.status === 'suspended') return 'Suspended';
  if (player.notes?.minutesLimit && player.minutesPlayed >= player.notes.minutesLimit) {
    return 'At Limit';
  }
  return 'Available';
}

export const ALL_POSITIONS: Position[] = [
  'GK',
  'CB', 'LB', 'RB', 'LWB', 'RWB',
  'CDM', 'CM', 'CAM', 'LM', 'RM',
  'LW', 'RW', 'ST', 'CF'
];

export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
