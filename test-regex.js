const reMutatedLine = /^\s*(\+|-)\s+(\d+):\s*(.+)$/;

const testLines = [
  "- 2:     return x * c",
  "+ 2:     return x / c",
  "  - 2:     return x * c",
  "  + 2:     return x / c"
];

testLines.forEach((line, index) => {
  console.log(`Test ${index + 1}: "${line}"`);
  console.log(`Regex test:`, reMutatedLine.test(line));
  const match = reMutatedLine.exec(line);
  console.log(`Match:`, match);
  console.log('---');
}); 