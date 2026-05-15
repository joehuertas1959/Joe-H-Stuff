'use strict';

let _browser = null;

async function fetchWithBrowser(url, { timeout = 30000, logger = console.log } = {}) {
  const puppeteer = require('puppeteer');
  if (!_browser) {
    logger('Browser: launching Chromium …');
    _browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  const page = await _browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    return await page.content();
  } finally {
    await page.close();
  }
}

async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

module.exports = { fetchWithBrowser, closeBrowser };
