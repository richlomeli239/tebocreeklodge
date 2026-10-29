const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Structured Data (JSON-LD) testing', () => {
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
