/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NeonTheme {
  id: string;
  name: string;
  subtitle: string;
  primary: string; // Main brand neon color
  secondary: string; // Accent neon color
  glow: string; // Ambient glow color
  primaryRgb: string; // e.g. "0, 229, 255"
  glowRgb: string;
  borderGradient: string; // Tailwind gradient classes
  isMulticolor?: boolean;
  previewColors?: string[];
}

export const NEON_THEMES: NeonTheme[] = [
  {
    id: 'multicolor',
    name: 'MULTICOLOR CYBER GLITCH',
    subtitle: 'Thème Principal Antares (Par Défaut)',
    primary: '#00E5FF',
    secondary: '#FF00E5',
    glow: '#C084FC',
    primaryRgb: '0, 229, 255',
    glowRgb: '192, 132, 252',
    borderGradient: 'from-[#00E5FF] via-[#FF00E5] via-[#FFE600] to-[#00FF88]',
    isMulticolor: true,
    previewColors: ['#9D00FF', '#00E5FF', '#FF00E5', '#00FF88', '#FFE600', '#FF6D00', '#FF1744'],
  },
  {
    id: 'violet',
    name: 'VIOLET GLITCH',
    subtitle: 'Néon Violet Cyberpunk Ambiant',
    primary: '#A855F7',
    secondary: '#00E5FF',
    glow: '#C084FC',
    primaryRgb: '168, 85, 247',
    glowRgb: '192, 132, 252',
    borderGradient: 'from-[#A855F7] via-[#00E5FF] to-[#C084FC]',
    previewColors: ['#A855F7', '#C084FC', '#00E5FF'],
  },
  {
    id: 'yellow',
    name: 'YELLOW GLITCH',
    subtitle: 'Lumière Jaune Cyber Ambré',
    primary: '#FFD600',
    secondary: '#FFF176',
    glow: '#FFEA00',
    primaryRgb: '255, 214, 0',
    glowRgb: '255, 234, 0',
    borderGradient: 'from-[#FFD600] via-[#FFF176] to-[#FFEA00]',
    previewColors: ['#FFD600', '#FFF176', '#FFEA00'],
  },
  {
    id: 'green',
    name: 'GREEN GLITCH',
    subtitle: 'Matrice Vert Toxique & Émeraude',
    primary: '#00FF88',
    secondary: '#00E5FF',
    glow: '#39FF14',
    primaryRgb: '0, 255, 136',
    glowRgb: '57, 255, 20',
    borderGradient: 'from-[#00FF88] via-[#00E5FF] to-[#39FF14]',
    previewColors: ['#00FF88', '#39FF14', '#00E5FF'],
  },
  {
    id: 'orange',
    name: 'ORANGE GLITCH',
    subtitle: 'Incendie Cyberpunk Flamboyant',
    primary: '#FF6D00',
    secondary: '#FFAB40',
    glow: '#FF9100',
    primaryRgb: '255, 109, 0',
    glowRgb: '255, 145, 0',
    borderGradient: 'from-[#FF6D00] via-[#FFAB40] to-[#FF9100]',
    previewColors: ['#FF6D00', '#FFAB40', '#FF9100'],
  },
  {
    id: 'red',
    name: 'RED GLITCH',
    subtitle: 'Alerte Rouge Cramoisi & Sang',
    primary: '#FF1744',
    secondary: '#FF5252',
    glow: '#FF003C',
    primaryRgb: '255, 23, 68',
    glowRgb: '255, 0, 60',
    borderGradient: 'from-[#FF1744] via-[#FF5252] to-[#FF003C]',
    previewColors: ['#FF1744', '#FF5252', '#FF003C'],
  },
  {
    id: 'cyan',
    name: 'CYAN GLITCH',
    subtitle: 'Froid Polaire & Électron Laser',
    primary: '#00E5FF',
    secondary: '#00FFD1',
    glow: '#00B8D4',
    primaryRgb: '0, 229, 255',
    glowRgb: '0, 184, 212',
    borderGradient: 'from-[#00E5FF] via-[#00FFD1] to-[#00B8D4]',
    previewColors: ['#00E5FF', '#00FFD1', '#00B8D4'],
  },
  {
    id: 'pink',
    name: 'PINK GLITCH',
    subtitle: 'Vaporwave Magenta Synthwave',
    primary: '#FF00E5',
    secondary: '#FF80AB',
    glow: '#FF00FF',
    primaryRgb: '255, 0, 229',
    glowRgb: '255, 0, 255',
    borderGradient: 'from-[#FF00E5] via-[#FF80AB] to-[#FF00FF]',
    previewColors: ['#FF00E5', '#FF80AB', '#FF00FF'],
  },
  {
    id: 'blue',
    name: 'BLUE GLITCH',
    subtitle: 'Cobalt Profond & Onde Saphir',
    primary: '#2979FF',
    secondary: '#00E5FF',
    glow: '#448AFF',
    primaryRgb: '41, 121, 255',
    glowRgb: '68, 138, 255',
    borderGradient: 'from-[#2979FF] via-[#00E5FF] to-[#448AFF]',
    previewColors: ['#2979FF', '#448AFF', '#00E5FF'],
  },
  {
    id: 'white',
    name: 'WHITE GLITCH',
    subtitle: 'Monochrome Pur & Spectre Lumineux',
    primary: '#F5F5F5',
    secondary: '#00E5FF',
    glow: '#FFFFFF',
    primaryRgb: '245, 245, 245',
    glowRgb: '255, 255, 255',
    borderGradient: 'from-[#FFFFFF] via-[#00E5FF] to-[#F5F5F5]',
    previewColors: ['#FFFFFF', '#F5F5F5', '#00E5FF'],
  },
  {
    id: 'gold',
    name: 'GOLD GLITCH',
    subtitle: 'Or Impérial & Éclat Solaire',
    primary: '#FFC400',
    secondary: '#FF6D00',
    glow: '#FFD740',
    primaryRgb: '255, 196, 0',
    glowRgb: '255, 215, 64',
    borderGradient: 'from-[#FFC400] via-[#FF6D00] to-[#FFD740]',
    previewColors: ['#FFC400', '#FFD740', '#FF6D00'],
  },
];

export const DEFAULT_THEME_ID = 'multicolor';

export function getThemeById(id?: string | null): NeonTheme {
  if (!id) return NEON_THEMES[0];
  const found = NEON_THEMES.find((t) => t.id === id);
  return found || NEON_THEMES[0];
}

export function applyThemeToDom(theme: NeonTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--neon-primary', theme.primary);
  root.style.setProperty('--neon-secondary', theme.secondary);
  root.style.setProperty('--neon-glow', theme.glow);
  root.style.setProperty('--neon-primary-rgb', theme.primaryRgb);
  root.style.setProperty('--neon-glow-rgb', theme.glowRgb);
  root.style.setProperty('--is-multicolor', theme.isMulticolor ? '1' : '0');
}
