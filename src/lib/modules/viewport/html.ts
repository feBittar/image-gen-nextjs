import { ModuleData } from '../types';

/**
 * Gera HTML para o módulo Viewport
 * O viewport não precisa de HTML extra (é apenas background do body)
 * Retorna string vazia
 */
export function getViewportHtml(_data: ModuleData): string {
  return '';
}
