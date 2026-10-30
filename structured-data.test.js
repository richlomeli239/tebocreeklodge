const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Structured Data (JSON-LD)', () => {
  const htmlFiles = [
    'index.html',
    'lodging.html',
    'outdoors.html',
    'contact.html',
    'bar-and-grill.html',
    'the-grill.html'
  ];

  test.each(htmlFiles)('%s contains valid JSON-LD if present', (file) => {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const dom = new JSDOM(html);
    const window = dom.window;

    const scripts = window.document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach(script => {
      // Must parse as valid JSON without throwing
      expect(() => JSON.parse(script.textContent)).not.toThrow();
    });
  });

  test('lodging.html contains valid Motel structured data', () => {
    const html = fs.readFileSync(path.join(__dirname, 'lodging.html'), 'utf8');
    const dom = new JSDOM(html);
    const window = dom.window;

    const scripts = window.document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);

    let foundMotel = false;

    scripts.forEach(script => {
      const data = JSON.parse(script.textContent);

      // Look for the Motel type in @graph
      if (data['@graph']) {
        const motelData = data['@graph'].find(item => item['@type'] === 'Motel');
        if (motelData) {
          foundMotel = true;
          expect(motelData.name).toBe('Tebo Creek Lodge - Accommodations & Motel');
          expect(motelData.telephone).toBe('+1-660-477-7777');
        }
      } else if (data['@type'] === 'Motel') {
        foundMotel = true;
        expect(data.name).toBe('Tebo Creek Lodge - Accommodations & Motel');
        expect(data.telephone).toBe('+1-660-477-7777');
      }
    });

    expect(foundMotel).toBe(true);
  });

  test('bar-and-grill.html has valid structured data', () => {
    const html = fs.readFileSync(path.join(__dirname, 'bar-and-grill.html'), 'utf8');

    // Create a new JSDOM instance
    const dom = new JSDOM(html);
    const window = dom.window;

    // Find the script tag for structured data
    const scriptTag = window.document.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).not.toBeNull();

    // Parse the JSON data
    let structuredData;
    expect(() => {
      structuredData = JSON.parse(scriptTag.textContent);
    }).not.toThrow();

    // Check the structure
    expect(structuredData).toBeDefined();
    expect(structuredData['@context']).toBe('https://schema.org');

    // Check that it has a @graph array
    expect(Array.isArray(structuredData['@graph'])).toBe(true);
    expect(structuredData['@graph'].length).toBeGreaterThan(0);

    // Extract types and flatten to handle both string and array of strings
    const types = structuredData['@graph'].map(item => item['@type']).flat();

    // Check specific entries as mentioned in the requirements
    expect(types).toContain('Restaurant');
  });
});
