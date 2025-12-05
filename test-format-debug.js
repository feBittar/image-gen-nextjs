const { validateCarouselData } = require('./dist/lib/schemas/carouselSchema.js');

const oldFormatData = {
  carousel: {
    photos: [],
    copy: {
      slides: [
        {
          numero: 1,
          estilo: 'stack-img',
          texto_1: 'Teste',
          texto_2: 'Formato antigo',
          destaques: {
            texto_1: ['Teste'],
            texto_2: ['antigo']
          }
        }
      ]
    }
  }
};

console.log('Testing old format validation...');
try {
  const validated = validateCarouselData(oldFormatData);
  console.log('\nValidated data:');
  console.log(JSON.stringify(validated, null, 2));
} catch (error) {
  console.error('Validation error:', error);
}
