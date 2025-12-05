import {
  stackTemplateSchema,
  stackTemplateDefaults,
  type StackTemplateFormData,
} from './stackTemplate';
import {
  bulletsCardsTemplateSchema,
  bulletsCardsTemplateDefaults,
  type BulletsCardsTemplateFormData,
} from './bulletsCardsTemplate';
import {
  fitfeedCapaTemplateSchema,
  fitfeedCapaTemplateDefaults,
  type FitFeedCapaTemplateFormData,
} from './fitfeedCapaTemplate';
import {
  versusTemplateSchema,
  versusTemplateDefaults,
  type VersusTemplateFormData,
} from './versusTemplate';
import {
  openloopTemplateSchema,
  openloopTemplateDefaults,
  type OpenLoopTemplateFormData,
} from './openloopTemplate';
import {
  versusDuoTemplateSchema,
  versusDuoTemplateDefaults,
  type VersusDuoTemplateFormData,
} from './versusDuoTemplate';

export const templateRegistry = {
  'stack': {
    schema: stackTemplateSchema,
    defaults: stackTemplateDefaults,
    displayName: 'Stack - Textos + Imagem',
  },
  'bullets-cards': {
    schema: bulletsCardsTemplateSchema,
    defaults: bulletsCardsTemplateDefaults,
    displayName: 'Bullets Cards - Header + Cards + Footer',
  },
  'fitfeed-capa': {
    schema: fitfeedCapaTemplateSchema,
    defaults: fitfeedCapaTemplateDefaults,
    displayName: 'FitFeed - Capa',
  },
  'versus': {
    schema: versusTemplateSchema,
    defaults: versusTemplateDefaults,
    displayName: 'Versus - Comparação de Imagens',
  },
  'openloop': {
    schema: openloopTemplateSchema,
    defaults: openloopTemplateDefaults,
    displayName: 'Open Loop - Título Impactante',
  },
  'versus-duo': {
    schema: versusDuoTemplateSchema,
    defaults: versusDuoTemplateDefaults,
    displayName: 'Versus Duo - Split Image',
  },
} as const;

export type TemplateId = keyof typeof templateRegistry;

// Union type of all template form data
export type AnyTemplateFormData =
  | StackTemplateFormData
  | BulletsCardsTemplateFormData
  | FitFeedCapaTemplateFormData
  | VersusTemplateFormData
  | OpenLoopTemplateFormData
  | VersusDuoTemplateFormData;

/**
 * Get template configuration by template ID
 * @param templateId - The template identifier
 * @returns The template configuration object containing schema, defaults, and displayName
 */
export function getTemplateConfig(templateId: TemplateId) {
  return templateRegistry[templateId];
}
