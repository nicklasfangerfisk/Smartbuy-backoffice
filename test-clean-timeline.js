// Demo of the new clean timeline design
console.log('🎯 Clean Timeline Design Demo\n');

const timelineItems = [
  'Eat',
  'Code', 
  'Sleep'
];

console.log('Clean Timeline Layout:');
console.log('=====================\n');

timelineItems.forEach((item, index) => {
  const isLast = index === timelineItems.length - 1;
  const dot = '●'; // Clean circular dot
  const line = isLast ? ' ' : '│'; // Vertical line
  
  console.log(`${dot} ${item}`);
  if (!isLast) {
    console.log(`${line}`);
  }
});

console.log('\n✅ Clean Timeline Features:');
console.log('• Simple circular dots');
console.log('• Clean vertical line');
console.log('• Minimal text layout');
console.log('• No excessive styling');
console.log('• Clear visual hierarchy');
console.log('• Current item highlighted');

console.log('\n🎨 Design Principles Applied:');
console.log('• Reduced visual noise');
console.log('• Consistent spacing');
console.log('• Clean typography');
console.log('• Subtle color differences');
console.log('• Focused on content');

console.log('\n🚀 Timeline now matches your clean design!');
