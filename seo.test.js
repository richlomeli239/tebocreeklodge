const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('SEO Meta Tags', () => {
  const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));

  test.each(htmlFiles)('%s contains required SEO title and description meta tags', (file) => {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Test title tag
    const titleElement = document.querySelector('title');
    expect(titleElement).not.toBeNull();
    expect(titleElement.textContent.trim().length).toBeGreaterThan(0);

    // Test description meta tag
    const descriptionElement = document.querySelector('meta[name="description"]');
    expect(descriptionElement).not.toBeNull();
    expect(descriptionElement.getAttribute('content')).not.toBeNull();
    expect(descriptionElement.getAttribute('content').trim().length).toBeGreaterThan(0);
  });
});

describe('SEO Structured Data (JSON-LD)', () => {
  const htmlFiles = [
    'index.html',
    'lodging.html',
    'outdoors.html',
    'contact.html',
    'bar-and-grill.html',
    'the-grill.html'
  ];

  test.each(htmlFiles)('%s contains valid JSON-LD scripts', (file) => {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');

    const dom = new JSDOM(html);
    const window = dom.window;

    const scripts = Array.from(window.document.querySelectorAll('script[type="application/ld+json"]'));

    // Each page should have at least one JSON-LD script for SEO
    expect(scripts.length).toBeGreaterThan(0);

    // Test that each JSON-LD script contains valid JSON and expected schema.org context
    scripts.forEach(script => {
      let parsedData;
      try {
        parsedData = JSON.parse(script.textContent);
      } catch (e) {
        throw new Error(`Invalid JSON in ${file}: ${e.message}\nContent:\n${script.textContent}`);
      }

      if (parsedData['@graph']) {
         // @context might be at the root level of @graph wrapper
         expect(parsedData['@context']).toBe('https://schema.org');
      } else if (Array.isArray(parsedData)) {
         parsedData.forEach(item => {
           expect(item['@context']).toBe('https://schema.org');
           expect(item['@type']).toBeDefined();
         });
      } else {
         expect(parsedData['@context']).toBe('https://schema.org');
         expect(parsedData['@type']).toBeDefined();
      }
    });
  });

  test('index.html has specific required structured data types', () => {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const dom = new JSDOM(html);
    const window = dom.window;
    const scripts = Array.from(window.document.querySelectorAll('script[type="application/ld+json"]'));

    const allTypes = scripts.flatMap(script => {
      const data = JSON.parse(script.textContent);
      if (data['@graph']) return data['@graph'].map(item => item['@type']);
      if (Array.isArray(data)) return data.map(item => item['@type']);
      return Array.isArray(data['@type']) ? data['@type'] : [data['@type']];
    });

    expect(allTypes).toContain('LocalBusiness');
    expect(allTypes).toContain('BreadcrumbList');
  });
});
