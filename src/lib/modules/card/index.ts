import { ModuleDefinition } from '../types';
import { cardSchema, CardData } from './schema';
import { getCardCss } from './css';
import { getCardHtml } from './html';
import { CardForm } from './CardForm';
import { SquareIcon } from 'lucide-react';

/**
 * Card Module Definition
 * Provides a centered container with customizable background, padding, gradient, and shadow
 */
export const cardModule: ModuleDefinition = {
  id: 'card',
  name: 'Card Container',
  description: 'Centered container with customizable styling',
  icon: SquareIcon,
  category: 'layout',
  schema: cardSchema,
  defaults: {
    enabled: true,
    width: 90,
    height: 90,
    specialPosition: 'center',
    positionPadding: 40,
    borderRadius: 0,
    backgroundType: 'color',
    backgroundColor: '#FFFFFF',
    backgroundImage: '',
    padding: {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    },
    gradientOverlay: {
      enabled: false,
      color: '#000000',
      startOpacity: 0.7,
      midOpacity: 0.3,
      endOpacity: 0,
      height: 50,
      direction: 'to top',
    },
    shadow: {
      enabled: false,
      x: 0,
      y: 10,
      blur: 30,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.3)',
    },
    layoutDirection: 'column',
    contentGap: '12px',
    contentAlign: 'stretch',
  } as CardData,
  FormComponent: CardForm as any,
  getCss: getCardCss,
  getHtml: getCardHtml,
  getStyleVariables: () => ({}),
  zIndex: 1,
  dependencies: [],
  conflicts: [],
};

// Export types for use in other modules
export type { CardData } from './schema';
