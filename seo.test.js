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
