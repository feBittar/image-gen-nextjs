const fs = require('fs');

// Ler o JSON do arquivo
const jsonPath = process.argv[2] || './test-carousel-full.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const slides = data.carousel.copy.slides;
const destaques = data.carousel.destaques || [];

console.log('\n=== VALIDAÇÃO DE DESTAQUES ===\n');

let totalErros = 0;

destaques.forEach(destaqueItem => {
  const slideNum = destaqueItem.numero;
  const slide = slides.find(s => s.numero === slideNum);

  if (!slide) {
    console.log(`❌ Slide ${slideNum}: NÃO ENCONTRADO\n`);
    totalErros++;
    return;
  }

  console.log(`\n--- Slide ${slideNum} (${slide.estilo}) ---`);

  Object.keys(destaqueItem.destaques).forEach(campoTexto => {
    const textoReal = slide[campoTexto];
    const destaquesArray = destaqueItem.destaques[campoTexto];

    if (!textoReal) {
      console.log(`  ⚠️  ${campoTexto}: CAMPO VAZIO`);
      totalErros++;
      return;
    }

    console.log(`\n  ${campoTexto}:`);
    console.log(`    Texto: "${textoReal.substring(0, 80)}..."`);

    destaquesArray.forEach(destaque => {
      const trecho = destaque.trecho;
      const encontrado = textoReal.includes(trecho);

      if (encontrado) {
        console.log(`    ✅ "${trecho}" - ${destaque.tipo}`);
      } else {
        console.log(`    ❌ "${trecho}" - NÃO ENCONTRADO!`);
        totalErros++;
      }
    });
  });
});

console.log(`\n\n=== RESUMO ===`);
console.log(`Total de erros: ${totalErros}`);
console.log(totalErros === 0 ? '✅ Todos os destaques são válidos!' : '❌ Existem destaques que não correspondem aos textos.');
console.log('');
