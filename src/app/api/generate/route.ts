import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { generateImage } from '@/lib/services/imageGenerator';
import { processTextField } from '@/lib/utils/textProcessor';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImageData {
  title: string | any;
  titleStyle?: any;
  subtitle?: string | any;
  subtitleStyle?: any;
  backgroundImage?: string;
  authorName?: string | any;
  template?: string;
  styledChunks?: any[];
  [key: string]: any;
}

// Template configuration for different template types
interface TemplateFieldConfig {
  textFields: string[];
  hasHeaderFooter?: boolean;
}

const TEMPLATE_CONFIGS: Record<string, TemplateFieldConfig> = {
  'stack': {
    textFields: ['text1', 'text2', 'text3', 'text4', 'text5'],
    hasHeaderFooter: false,
  },
  'bullets-cards': {
    textFields: ['bullet1Text', 'bullet2Text', 'bullet3Text', 'bullet4Text', 'bullet5Text'],
    hasHeaderFooter: true,
  },
  'fitfeed-capa': {
    textFields: ['title'],
    hasHeaderFooter: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const imageData: ImageData = await request.json();

    console.log('\n========== DEBUG /api/generate ==========');
    console.log('imageData received:', JSON.stringify(imageData, null, 2));

    // Get template configuration
    const templateName = imageData.template || 'stack';
    const templateConfig = TEMPLATE_CONFIGS[templateName] || TEMPLATE_CONFIGS['stack'];

    console.log(`\n--- Processing ${templateName} template ---`);

    // Process header/footer fields for bullets-cards template
    if (templateConfig.hasHeaderFooter) {
      // Process headerText
      const headerField = typeof imageData.headerText === 'string' && imageData.styledChunks
        ? {
            text: imageData.headerText,
            styledChunks: imageData.styledChunks.filter((c: any) => c.field === 'headerText')
          }
        : imageData.headerText;

      const processedHeader = processTextField(headerField, imageData.headerTextStyle);
      if (processedHeader) {
        imageData.headerText = processedHeader;
      }
      console.log('Processed headerText:', processedHeader);

      // Process footerText
      const footerField = typeof imageData.footerText === 'string' && imageData.styledChunks
        ? {
            text: imageData.footerText,
            styledChunks: imageData.styledChunks.filter((c: any) => c.field === 'footerText')
          }
        : imageData.footerText;

      const processedFooter = processTextField(footerField, imageData.footerTextStyle);
      if (processedFooter) {
        imageData.footerText = processedFooter;
      }
      console.log('Processed footerText:', processedFooter);
    } else if (!templateConfig.textFields.includes('title') && !templateConfig.textFields.includes('subtitle')) {
      // Process title/subtitle ONLY for templates that don't have these fields in textFields
      // (e.g., stack template which uses text1-text5 instead)
      const titleField = typeof imageData.title === 'string' && imageData.styledChunks
        ? {
            text: imageData.title,
            styledChunks: imageData.styledChunks.filter((c: any) => !c.field || c.field === 'title')
          }
        : imageData.title;

      const subtitleField = typeof imageData.subtitle === 'string' && imageData.styledChunks
        ? {
            text: imageData.subtitle,
            styledChunks: imageData.styledChunks.filter((c: any) => c.field === 'subtitle')
          }
        : imageData.subtitle;

      const processedTitle = processTextField(titleField, imageData.titleStyle);
      const processedSubtitle = processTextField(subtitleField, imageData.subtitleStyle);

      if (processedTitle) {
        imageData.title = processedTitle;
      }
      if (processedSubtitle) {
        imageData.subtitle = processedSubtitle;
      }

      console.log('Processed title:', processedTitle);
      console.log('Processed subtitle:', processedSubtitle);
    }

    // Helper function to convert special styling to styled chunks
    const convertSpecialStylingToChunks = async (
      textValue: string,
      titleStyle: any,
      specialStyling: any,
      cardWidth: number
    ) => {
      if (!specialStyling || !specialStyling.enabled || !specialStyling.lineStyles || specialStyling.lineStyles.length === 0) {
        return null;
      }

      console.log('[Special Styling] Converting to styled chunks...');

      try {
        // Call detect-lines API to get the lines
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/detect-lines`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: textValue,
            titleStyle: titleStyle,
            cardWidth: cardWidth,
            titleSpecialStyling: specialStyling,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          console.error('[Special Styling] Detection failed:', result.error);
          return null;
        }

        const { lines } = result.data;
        console.log('[Special Styling] Detected lines:', lines);

        // Convert lines to styled chunks
        const styledChunks = lines.map((lineText: string, index: number) => {
          const lineStyle = specialStyling.lineStyles[index] || {};

          return {
            text: lineText,
            color: lineStyle.color,
            fontFamily: lineStyle.fontFamily,
            fontSize: lineStyle.fontSize,
            fontWeight: lineStyle.fontWeight,
            bold: lineStyle.bold,
            italic: lineStyle.italic,
            letterSpacing: lineStyle.letterSpacing,
            backgroundColor: lineStyle.backgroundColor,
            padding: lineStyle.padding,
          };
        });

        console.log('[Special Styling] Generated styled chunks:', styledChunks);
        return styledChunks;

      } catch (error) {
        console.error('[Special Styling] Error:', error);
        return null;
      }
    };

    // Helper function to process text fields with styled chunks support
    const processTextFieldWithChunks = (
      fieldName: string,
      textValue: string,
      styledChunks: any[] | undefined,
      styleValue: any
    ) => {
      if (textValue && textValue.trim()) {
        console.log(`Processing ${fieldName}:`, textValue);

        // If styledChunks exist, create rich text object
        if (styledChunks && Array.isArray(styledChunks) && styledChunks.length > 0) {
          const richTextField = {
            text: textValue,
            styledChunks: styledChunks
          };
          const processed = processTextField(richTextField, styleValue);
          console.log(`Processed ${fieldName} with chunks:`, processed);
          return processed;
        } else {
          // No chunks, process as simple string
          const processed = processTextField(textValue, styleValue);
          console.log(`Processed ${fieldName}:`, processed);
          return processed;
        }
      }
      return textValue;
    };

    // Process template-specific text fields dynamically
    console.log(`\n--- Processing ${templateName} template fields ---`);

    // Special handling for fitfeed-capa template with special styling
    if (templateName === 'fitfeed-capa' && imageData.titleSpecialStyling?.enabled) {
      console.log('[FitFeed Capa] Processing with special styling...');

      // Convert special styling to styled chunks
      const specialChunks = await convertSpecialStylingToChunks(
        imageData.title,
        imageData.titleStyle,
        imageData.titleSpecialStyling,
        imageData.cardWidth || 90
      );

      if (specialChunks) {
        // Override titleStyledChunks with special styling chunks
        imageData.titleStyledChunks = specialChunks;
        console.log('[FitFeed Capa] Applied special styling chunks');
      }
    }

    templateConfig.textFields.forEach((fieldName) => {
      const textValue = imageData[fieldName];
      const styledChunksKey = `${fieldName}StyledChunks`;
      const styleKey = `${fieldName}Style`;

      if (textValue && textValue.trim()) {
        imageData[fieldName] = processTextFieldWithChunks(
          fieldName,
          textValue,
          imageData[styledChunksKey],
          imageData[styleKey]
        );
      }
    });

    // Validate at least one text field is present
    const hasText = templateConfig.hasHeaderFooter
      ? imageData.headerText || imageData.footerText || templateConfig.textFields.some(f => imageData[f])
      : imageData.title || imageData.subtitle || templateConfig.textFields.some(f => imageData[f]);

    console.log('\n--- Validation ---');
    console.log('hasText:', hasText);

    if (!hasText) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one text field is required'
        },
        { status: 400 }
      );
    }

    // Build template path
    const templatesDir = path.join(process.cwd(), 'templates');
    const templatePath = path.join(templatesDir, `${templateName}.html`);

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        {
          success: false,
          error: `Template "${templateName}" not found`
        },
        { status: 404 }
      );
    }

    // Generate output path
    const timestamp = Date.now();
    const filename = `image-${timestamp}.png`;
    const outputDir = path.join(process.cwd(), 'public', 'output');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);

    // Generate image
    console.log('\n========== Calling generateImage ==========');
    console.log('[Generate] Template:', templateName);
    console.log('[Generate] Output path:', outputPath);
    console.log('[Generate] Data summary:');
    console.log('  - text1:', imageData.text1 ? `"${imageData.text1.substring(0, 50)}"` : 'empty');
    console.log('  - text2:', imageData.text2 ? `"${imageData.text2.substring(0, 50)}"` : 'empty');
    console.log('  - cardBackgroundImage:', imageData.cardBackgroundImage || 'none');

    const result = await generateImage({
      templatePath,
      data: imageData,
      width: 1080,
      height: 1440,
      outputPath,
      format: 'png',
      quality: 100
    });

    console.log('[Generate] Result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate image');
    }

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: `/output/${filename}`,
        timestamp
      }
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image'
      },
      { status: 500 }
    );
  }
}
