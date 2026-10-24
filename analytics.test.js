const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Google Analytics Initialization', () => {
  const htmlFiles = [
    'index.html',
    'lodging.html',
    'outdoors.html',
    'contact.html',
    'bar-and-grill.html'
  ];

  test.each(htmlFiles)('%s initializes Google Analytics correctly', (file) => {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');

    // Create a new JSDOM instance, executing scripts
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const window = dom.window;

    // Test dataLayer initialization
    expect(window.dataLayer).toBeDefined();
    expect(window.dataLayer.length).toBe(2);

    // First push should be js and current Date
    expect(window.dataLayer[0][0]).toBe('js');
    expect(window.dataLayer[0][1]).toBeInstanceOf(window.Date);

    // Second push should be config and the GA ID
    expect(window.dataLayer[1][0]).toBe('config');
    expect(window.dataLayer[1][1]).toBe('G-1B2RLSZ0Q9');

    // Test gtag function availability and behavior
    expect(typeof window.gtag).toBe('function');

    // Mock push to see if gtag works as expected
    const initialLength = window.dataLayer.length;
    window.gtag('event', 'test_event');
    expect(window.dataLayer.length).toBe(initialLength + 1);
    expect(window.dataLayer[initialLength][0]).toBe('event');
    expect(window.dataLayer[initialLength][1]).toBe('test_event');

    // Test that the external GA script is included
    const scripts = Array.from(window.document.querySelectorAll('script'));
    const gaScript = scripts.find(s => s.src.includes('googletagmanager.com/gtag/js'));
    expect(gaScript).toBeDefined();
    expect(gaScript.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-1B2RLSZ0Q9');
    // Using hasAttribute because jsdom might not fully support the async property reflection correctly on the script tag object in this specific version setup
    expect(gaScript.hasAttribute('async')).toBe(true);
  });
});
