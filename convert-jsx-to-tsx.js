#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all .jsx files
const jsxFiles = execSync('find . -name "*.jsx" -type f', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(file => file.length > 0);

console.log(`Found ${jsxFiles.length} .jsx files to convert`);

// Function to add TypeScript types to React components
function addTypeScriptTypes(content, filename) {
  let modifiedContent = content;
  
  // Add React import if not present
  if (!modifiedContent.includes('import React') && !modifiedContent.includes('import * as React')) {
    modifiedContent = `import React from 'react';\n${modifiedContent}`;
  }
  
  // Convert function components to have proper TypeScript types
  // Pattern: const ComponentName = ({ prop1, prop2, ...rest }) => {
  modifiedContent = modifiedContent.replace(
    /const\s+(\w+)\s*=\s*\(\s*\{\s*([^}]*)\s*\}\s*\)\s*=>\s*\{/g,
    (match, componentName, props) => {
      if (props.trim()) {
        return `interface ${componentName}Props {\n  ${props.split(',').map(prop => {
          const propName = prop.trim().split(':')[0].replace('...', '');
          return `${propName}?: any;`;
        }).join('\n  ')}\n}\n\nconst ${componentName}: React.FC<${componentName}Props> = ({ ${props} }) => {`;
      } else {
        return `const ${componentName}: React.FC = () => {`;
      }
    }
  );
  
  // Convert function declarations to TypeScript
  // Pattern: function ComponentName({ prop1, prop2 }) {
  modifiedContent = modifiedContent.replace(
    /function\s+(\w+)\s*\(\s*\{\s*([^}]*)\s*\}\s*\)\s*\{/g,
    (match, componentName, props) => {
      if (props.trim()) {
        return `interface ${componentName}Props {\n  ${props.split(',').map(prop => {
          const propName = prop.trim().split(':')[0].replace('...', '');
          return `${propName}?: any;`;
        }).join('\n  ')}\n}\n\nfunction ${componentName}({ ${props} }: ${componentName}Props) {`;
      } else {
        return `function ${componentName}() {`;
      }
    }
  );
  
  return modifiedContent;
}

// Convert each file
jsxFiles.forEach((jsxFile, index) => {
  console.log(`Converting ${index + 1}/${jsxFiles.length}: ${jsxFile}`);
  
  try {
    // Read the .jsx file
    const content = fs.readFileSync(jsxFile, 'utf8');
    
    // Add TypeScript types
    const typedContent = addTypeScriptTypes(content, jsxFile);
    
    // Create .tsx filename
    const tsxFile = jsxFile.replace('.jsx', '.tsx');
    
    // Write the .tsx file
    fs.writeFileSync(tsxFile, typedContent);
    
    console.log(`✅ Created: ${tsxFile}`);
    
  } catch (error) {
    console.error(`❌ Error converting ${jsxFile}:`, error.message);
  }
});

console.log('\n🎉 Conversion complete! Now you can remove the .jsx files.');
console.log('Run: find . -name "*.jsx" -type f -delete');