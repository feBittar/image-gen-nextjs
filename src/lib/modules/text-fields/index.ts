import { ModuleDefinition } from '../types';
import { textFieldsSchema, TextFieldsData } from './schema';
import { getTextFieldsCss } from './css';
import { getTextFieldsHtml } from './html';
import { TextFieldsForm } from './TextFieldsForm';
import { TypeIcon } from 'lucide-react';

/**
 * TextFields Module Definition
 * Manages multiple text fields with individual styling, styled chunks, and spacing control
 */
export const textFieldsModule: ModuleDefinition = {
  id: 'textFields',
  name: 'Text Fields',
  description: 'Multiple text fields with individual styling and rich formatting',
  icon: TypeIcon,
  category: 'content',
  schema: textFieldsSchema,
  defaults: {
    count: 5,
    gap: 20,
    verticalAlign: 'bottom',
    fields: [
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
        freePosition: false,
        position: { top: '50px', left: '50px' },
        specialPosition: 'none',
        specialPadding: 8,
      },
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
        freePosition: false,
        position: { top: '100px', left: '50px' },
        specialPosition: 'none',
        specialPadding: 8,
      },
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
        freePosition: false,
        position: { top: '150px', left: '50px' },
        specialPosition: 'none',
        specialPadding: 8,
      },
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
        freePosition: false,
        position: { top: '200px', left: '50px' },
        specialPosition: 'none',
        specialPadding: 8,
      },
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
        freePosition: false,
        position: { top: '250px', left: '50px' },
        specialPosition: 'none',
        specialPadding: 8,
      },
    ],
    layoutWidth: '50%',
    alignSelf: 'stretch',
    autoSizeMode: 'off',
    autoSizeLargerIndex: 0,
  } as TextFieldsData,
  FormComponent: TextFieldsForm as any,
  getCss: getTextFieldsCss,
  getHtml: getTextFieldsHtml,
  getStyleVariables: () => ({}),
  zIndex: 10,
  dependencies: [], // Can work standalone or inside a card
  conflicts: [],
  allowMultipleInstances: true, // Can have multiple text field instances
};

// Export types for use in other modules
export type { TextFieldsData, TextField } from './schema';
