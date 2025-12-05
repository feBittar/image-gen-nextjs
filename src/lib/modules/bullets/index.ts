import { ModuleDefinition } from '../types';
import { bulletsSchema, BulletsData } from './schema';
import { getBulletsCss, getBulletsStyleVariables } from './css';
import { getBulletsHtml } from './html';
import { BulletsForm } from './BulletsForm';
import { List } from 'lucide-react';

/**
 * Bullets Module Definition
 * Displays bullet points/cards with icons and text
 */
export const bulletsModule: ModuleDefinition = {
  id: 'bullets',
  name: 'Bullets',
  description: 'Bullet points/cards with icons, text, and individual styling',
  icon: List,
  category: 'content',
  schema: bulletsSchema,
  defaults: {
    items: [
      {
        enabled: true,
        icon: '✓',
        iconType: 'emoji',
        text: '',
        styledChunks: [],
        backgroundColor: '#FFFFFF',
        textStyle: {
          fontFamily: 'Arial',
          fontSize: '18px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
        },
      },
      {
        enabled: true,
        icon: '✓',
        iconType: 'emoji',
        text: '',
        styledChunks: [],
        backgroundColor: '#FFFFFF',
        textStyle: {
          fontFamily: 'Arial',
          fontSize: '18px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
        },
      },
      {
        enabled: true,
        icon: '✓',
        iconType: 'emoji',
        text: '',
        styledChunks: [],
        backgroundColor: '#FFFFFF',
        textStyle: {
          fontFamily: 'Arial',
          fontSize: '18px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
        },
      },
    ],
    layout: 'vertical',
    gap: 15,
    itemPadding: '16px 20px',
    borderRadius: 8,
    iconSize: 48,
    iconBackgroundColor: '#000000',
    iconColor: '#FFFFFF',
    iconGap: 16,
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cardMinHeight: 0,
  } as BulletsData,
  FormComponent: BulletsForm as any,
  getCss: getBulletsCss,
  getHtml: getBulletsHtml,
  getStyleVariables: getBulletsStyleVariables,
  zIndex: 10,
  dependencies: [],
  conflicts: [],
};

// Export types for use in other modules
export type { BulletsData, BulletItem } from './schema';
