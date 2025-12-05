'use client';

import * as React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from './ColorPicker';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFontOptions } from '@/lib/constants/fonts';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export interface StyledChunk {
  text: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: string;
  backgroundColor?: string;
  backgroundBlur?: string;
  blurColor?: string;
  blurOpacity?: number;
  blurFadeDirection?: 'horizontal' | 'vertical' | 'both';
  blurFadeAmount?: number;
  padding?: string;
  lineBreak?: boolean;
}

interface StyledChunksEditorProps {
  fieldName: string;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  /** Optional custom path for styledChunks (defaults to `${fieldName}StyledChunks`) */
  chunksPath?: string;
}

export function StyledChunksEditor({
  fieldName,
  watch,
  setValue,
  chunksPath,
}: StyledChunksEditorProps) {
  const chunksFieldName = chunksPath || `${fieldName}StyledChunks`;
  const chunks = (watch(chunksFieldName) as StyledChunk[]) || [];
  const textContent = watch(fieldName) || '';

  const [expandedChunkIndex, setExpandedChunkIndex] = React.useState<number | null>(null);
  const [newChunkText, setNewChunkText] = React.useState('');

  const fontOptions = getFontOptions();

  // Add a new chunk
  const handleAddChunk = () => {
    if (!newChunkText.trim()) return;

    // Validate that the text exists in the field content
    if (!textContent.includes(newChunkText)) {
      alert(`O texto "${newChunkText}" não foi encontrado no campo de texto!`);
      return;
    }

    const newChunk: StyledChunk = {
      text: newChunkText,
    };

    setValue(chunksFieldName, [...chunks, newChunk] as any);
    setNewChunkText('');
    setExpandedChunkIndex(chunks.length); // Expand the newly added chunk
  };

  // Remove a chunk
  const handleRemoveChunk = (index: number) => {
    const updatedChunks = chunks.filter((_, i) => i !== index);
    setValue(chunksFieldName, updatedChunks as any);
    if (expandedChunkIndex === index) {
      setExpandedChunkIndex(null);
    }
  };

  // Update chunk property
  const handleUpdateChunk = (index: number, property: keyof StyledChunk, value: any) => {
    const updatedChunks = [...chunks];
    updatedChunks[index] = {
      ...updatedChunks[index],
      [property]: value,
    };
    setValue(chunksFieldName, updatedChunks as any);
  };

  // Toggle chunk expansion
  const toggleChunkExpansion = (index: number) => {
    setExpandedChunkIndex(expandedChunkIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Trechos Estilizados</Label>
        <p className="text-xs text-muted-foreground">
          Selecione partes do texto acima para aplicar estilos específicos
        </p>
      </div>

      {/* Add New Chunk */}
      <Card className="p-4 border-dashed">
        <div className="space-y-3">
          <Label htmlFor={`${fieldName}-new-chunk`} className="text-sm">
            Adicionar Novo Trecho
          </Label>
          <div className="flex gap-2">
            <Input
              id={`${fieldName}-new-chunk`}
              placeholder="Digite o texto exato do trecho..."
              value={newChunkText}
              onChange={(e) => setNewChunkText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChunk();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddChunk}
              disabled={!newChunkText.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Dica: O texto deve corresponder exatamente a uma parte do texto acima
          </p>
        </div>
      </Card>

      {/* Existing Chunks */}
      {chunks.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Trechos Configurados ({chunks.length})
          </Label>
          {chunks.map((chunk, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-3">
                {/* Chunk Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleChunkExpansion(index)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedChunkIndex === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Badge variant="outline" className="font-mono text-xs">
                      {chunk.text}
                    </Badge>
                    {chunk.color && (
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: chunk.color }}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChunk(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Chunk Style Controls (Expandable) */}
                {expandedChunkIndex === index && (
                  <>
                    <Separator />
                    <div className="space-y-3 pl-4">
                      {/* Color */}
                      <ColorPicker
                        label="Cor do Texto"
                        color={chunk.color || '#000000'}
                        onChange={(value) => handleUpdateChunk(index, 'color', value)}
                      />

                      {/* Font Family */}
                      <div className="space-y-2">
                        <Label className="text-xs">Fonte</Label>
                        <Select
                          value={chunk.fontFamily || 'Arial'}
                          onValueChange={(value) =>
                            handleUpdateChunk(index, 'fontFamily', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {fontOptions.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Font Size */}
                      <div className="space-y-2">
                        <Label className="text-xs">Tamanho Customizado</Label>
                        <Input
                          type="text"
                          placeholder="ex: 24px, 1.5em (vazio = herda do pai)"
                          value={chunk.fontSize || ''}
                          onChange={(e) =>
                            handleUpdateChunk(index, 'fontSize', e.target.value || undefined)
                          }
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Bold, Italic & Underline */}
                      <div className="flex gap-2 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chunk.bold || false}
                            onChange={(e) =>
                              handleUpdateChunk(index, 'bold', e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-xs">Negrito</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chunk.italic || false}
                            onChange={(e) =>
                              handleUpdateChunk(index, 'italic', e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-xs">Itálico</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chunk.underline || false}
                            onChange={(e) =>
                              handleUpdateChunk(index, 'underline', e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-xs">Sublinhado</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chunk.lineBreak || false}
                            onChange={(e) =>
                              handleUpdateChunk(index, 'lineBreak', e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-xs">Quebra de Linha</span>
                        </label>
                      </div>

                      {/* Background Color */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`${fieldName}-chunk-${index}-bg`}
                            checked={!!chunk.backgroundColor}
                            onChange={(e) =>
                              handleUpdateChunk(
                                index,
                                'backgroundColor',
                                e.target.checked ? '#ffff00' : undefined
                              )
                            }
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`${fieldName}-chunk-${index}-bg`}
                            className="text-xs cursor-pointer"
                          >
                            Cor de Fundo
                          </Label>
                        </div>
                        {chunk.backgroundColor && (
                          <ColorPicker
                            label=""
                            color={chunk.backgroundColor}
                            onChange={(value) =>
                              handleUpdateChunk(index, 'backgroundColor', value)
                            }
                          />
                        )}
                      </div>

                      {/* Background Blur */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`${fieldName}-chunk-${index}-blur`}
                            checked={!!chunk.backgroundBlur}
                            onChange={(e) =>
                              handleUpdateChunk(
                                index,
                                'backgroundBlur',
                                e.target.checked ? '8px' : undefined
                              )
                            }
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`${fieldName}-chunk-${index}-blur`}
                            className="text-xs cursor-pointer"
                          >
                            Fundo Desfocado (Blur)
                          </Label>
                        </div>
                        {chunk.backgroundBlur && (
                          <Input
                            type="text"
                            placeholder="ex: 8px, 12px"
                            value={chunk.backgroundBlur}
                            onChange={(e) =>
                              handleUpdateChunk(index, 'backgroundBlur', e.target.value || '8px')
                            }
                            className="h-8 text-xs"
                          />
                        )}
                        {chunk.backgroundBlur && (
                          <div className="space-y-3 mt-2 pl-4 border-l-2 border-muted">
                            {/* Fade Direction */}
                            <div className="space-y-2">
                              <Label className="text-xs">Direção do Fade</Label>
                              <Select
                                value={chunk.blurFadeDirection || 'vertical'}
                                onValueChange={(value) =>
                                  handleUpdateChunk(index, 'blurFadeDirection', value)
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="vertical">Vertical (Cima/Baixo)</SelectItem>
                                  <SelectItem value="horizontal">Horizontal (Esquerda/Direita)</SelectItem>
                                  <SelectItem value="both">Ambos</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Fade Amount */}
                            <div className="space-y-1">
                              <Label className="text-xs">
                                Intensidade do Fade: {chunk.blurFadeAmount || 8}%
                              </Label>
                              <input
                                type="range"
                                min="0"
                                max="25"
                                value={chunk.blurFadeAmount || 8}
                                onChange={(e) =>
                                  handleUpdateChunk(
                                    index,
                                    'blurFadeAmount',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                        {chunk.backgroundBlur && (
                          <div className="space-y-2 mt-2 pl-4 border-l-2 border-muted">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${fieldName}-chunk-${index}-blur-color`}
                                checked={!!chunk.blurColor}
                                onChange={(e) => {
                                  const updatedChunks = [...chunks];
                                  if (e.target.checked) {
                                    updatedChunks[index] = {
                                      ...updatedChunks[index],
                                      blurColor: '#000000',
                                      blurOpacity: 0.3,
                                    };
                                  } else {
                                    updatedChunks[index] = {
                                      ...updatedChunks[index],
                                      blurColor: undefined,
                                      blurOpacity: undefined,
                                    };
                                  }
                                  setValue(chunksFieldName, updatedChunks as any);
                                }}
                                className="h-4 w-4"
                              />
                              <Label
                                htmlFor={`${fieldName}-chunk-${index}-blur-color`}
                                className="text-xs cursor-pointer"
                              >
                                Adicionar Cor ao Blur
                              </Label>
                            </div>
                            {chunk.blurColor && (
                              <>
                                <ColorPicker
                                  label="Cor"
                                  color={chunk.blurColor}
                                  onChange={(value) =>
                                    handleUpdateChunk(index, 'blurColor', value)
                                  }
                                />
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    Opacidade: {Math.round((chunk.blurOpacity || 0.3) * 100)}%
                                  </Label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={(chunk.blurOpacity || 0.3) * 100}
                                    onChange={(e) =>
                                      handleUpdateChunk(
                                        index,
                                        'blurOpacity',
                                        parseInt(e.target.value) / 100
                                      )
                                    }
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Letter Spacing */}
                      <div className="space-y-2">
                        <Label htmlFor={`${fieldName}-chunk-${index}-spacing`} className="text-xs">
                          Espaçamento de Letras
                        </Label>
                        <Input
                          id={`${fieldName}-chunk-${index}-spacing`}
                          type="text"
                          placeholder="ex: 2px"
                          value={chunk.letterSpacing || ''}
                          onChange={(e) =>
                            handleUpdateChunk(index, 'letterSpacing', e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Padding */}
                      <div className="space-y-2">
                        <Label htmlFor={`${fieldName}-chunk-${index}-padding`} className="text-xs">
                          Padding (Espaçamento Interno)
                        </Label>
                        <Input
                          id={`${fieldName}-chunk-${index}-padding`}
                          type="text"
                          placeholder="ex: 4px, 8px 12px, 4px 8px 4px 12px"
                          value={chunk.padding || ''}
                          onChange={(e) =>
                            handleUpdateChunk(index, 'padding', e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Aceita 1 a 4 valores (top right bottom left)
                        </p>
                      </div>

                      {/* Clear All Styles Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedChunks = [...chunks];
                          updatedChunks[index] = { text: chunk.text };
                          setValue(chunksFieldName, updatedChunks as any);
                        }}
                        className="w-full text-xs"
                      >
                        Limpar Todos os Estilos
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Section */}
      {chunks.length > 0 && textContent && (
        <Card className="p-4 bg-muted/50">
          <Label className="text-xs font-medium mb-2 block">
            Visualização (Aproximada)
          </Label>
          <div className="text-sm">
            {renderPreview(textContent, chunks)}
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper function to render preview
function renderPreview(text: string, chunks: StyledChunk[]) {
  if (!chunks || chunks.length === 0) {
    return <span>{text}</span>;
  }

  // Sort chunks by their position in the text
  const sortedChunks = [...chunks]
    .map((chunk) => ({
      chunk,
      index: text.indexOf(chunk.text),
    }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index);

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedChunks.forEach(({ chunk, index }, i) => {
    // Add text before chunk
    if (index > lastIndex) {
      elements.push(
        <span key={`text-${i}`}>{text.substring(lastIndex, index)}</span>
      );
    }

    // Add styled chunk
    // Calculate blur background color with opacity
    let blurBgColor: string | undefined;
    if (chunk.backgroundBlur && chunk.blurColor) {
      const opacity = chunk.blurOpacity || 0.3;
      // Convert hex to rgba
      const hex = chunk.blurColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      blurBgColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Calculate fade gradient based on direction and amount
    let maskImage: string | undefined;
    if (chunk.backgroundBlur) {
      const fadeAmount = chunk.blurFadeAmount ?? 8;
      const fadeDirection = chunk.blurFadeDirection || 'vertical';
      const fadeEnd = 100 - fadeAmount;

      if (fadeAmount > 0) {
        if (fadeDirection === 'vertical') {
          maskImage = `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
        } else if (fadeDirection === 'horizontal') {
          maskImage = `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
        } else if (fadeDirection === 'both') {
          const vGradient = `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
          const hGradient = `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
          maskImage = `${vGradient}, ${hGradient}`;
        }
      }
    }

    const style: React.CSSProperties = {
      color: chunk.color,
      fontFamily: chunk.fontFamily,
      fontSize: chunk.fontSize,
      fontWeight: chunk.bold ? 'bold' : undefined,
      fontStyle: chunk.italic ? 'italic' : undefined,
      textDecoration: chunk.underline ? 'underline' : undefined,
      letterSpacing: chunk.letterSpacing,
      backgroundColor: blurBgColor || chunk.backgroundColor,
      backdropFilter: chunk.backgroundBlur ? `blur(${chunk.backgroundBlur})` : undefined,
      WebkitBackdropFilter: chunk.backgroundBlur ? `blur(${chunk.backgroundBlur})` : undefined,
      maskImage: maskImage,
      WebkitMaskImage: maskImage,
      maskComposite: chunk.blurFadeDirection === 'both' ? 'intersect' : undefined,
      padding: chunk.padding || (chunk.backgroundColor || chunk.backgroundBlur ? '2px 4px' : undefined),
      borderRadius: chunk.backgroundBlur ? '16px' : (chunk.backgroundColor ? '2px' : undefined),
    };

    elements.push(
      <span key={`chunk-${i}`} style={style}>
        {chunk.text}
      </span>
    );

    // Add line break if requested
    if (chunk.lineBreak) {
      elements.push(
        <span
          key={`br-${i}`}
          style={{ display: 'block', width: '100%', height: '0.5em' }}
        />
      );
    }

    lastIndex = index + chunk.text.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
  }

  return <>{elements}</>;
}
