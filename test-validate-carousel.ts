import { safeValidateCarouselData } from './src/lib/schemas/carouselSchema';
import fs from 'fs';

const carouselJSON = JSON.parse(fs.readFileSync('test-carousel.json', 'utf-8'));

console.log('\n========== VALIDATING CAROUSEL JSON ==========\n');

const result = safeValidateCarouselData(carouselJSON);

if (result.success) {
  console.log('✅ Validation PASSED!');
  console.log(`\nSlides count: ${result.data.carousel.copy.slides.length}`);
  console.log(`Photos count: ${result.data.carousel.photos?.length || 0}`);
  console.log(`Destaques count: ${result.data.carousel.destaques?.length || 0}`);
} else {
  console.log('❌ Validation FAILED!\n');
  console.error('Errors:');
  result.error.issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.message}`);
    console.log(`   Path: ${issue.path.join(' → ')}`);
    console.log(`   Code: ${issue.code}`);
  });
}

console.log('\n==============================================\n');
