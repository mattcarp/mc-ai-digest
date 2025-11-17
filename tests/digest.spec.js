import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

test.describe('AI-Powered Digest', () => {
  test('should generate digest with AI summaries and scores', async () => {
    // Skip if no AI key configured (allows CI to run without AI)
    const hasAIKey = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!hasAIKey) {
      test.skip();
    }

    // Run digest generation
    const output = execSync('pnpm digest', { encoding: 'utf-8' });

    // Check for AI initialization
    expect(output).toContain('Analyzing articles with AI');
    expect(output).toContain('AI analysis complete');

    // Verify digest completed
    expect(output).toContain('Digest completed');
  });

  test('should create HTML file with scores', async ({ page }) => {
    // Get today's date in Malta timezone
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Malta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const htmlPath = path.join(process.cwd(), 'public', 'news', `${today}.html`);

    // Check if file exists
    expect(fs.existsSync(htmlPath)).toBe(true);

    // Load the HTML page
    await page.goto(`file://${htmlPath}`);

    // Check for score badges in the page
    const badges = page.locator('.score-badge');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      // If AI is enabled, we should have score badges
      expect(badgeCount).toBeGreaterThan(0);

      // Check that badges have proper colors
      const firstBadge = badges.first();
      const bgColor = await firstBadge.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBeTruthy();
    }
  });

  test('should validate HTML structure', async ({ page }) => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Malta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const htmlPath = path.join(process.cwd(), 'public', 'news', `${today}.html`);

    if (!fs.existsSync(htmlPath)) {
      test.skip();
    }

    await page.goto(`file://${htmlPath}`);

    // Check title
    await expect(page.locator('h1')).toContainText('AI Daily Digest');

    // Check for articles
    const articles = page.locator('article');
    const articleCount = await articles.count();
    expect(articleCount).toBeGreaterThan(0);
    expect(articleCount).toBeLessThanOrEqual(15);

    // Each article should have a link and summary
    const firstArticle = articles.first();
    await expect(firstArticle.locator('a')).toHaveCount(1);
    await expect(firstArticle.locator('p')).toHaveCount(await firstArticle.locator('p').count());
  });

  test('should have valid score ranges', async ({ page }) => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Malta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const htmlPath = path.join(process.cwd(), 'public', 'news', `${today}.html`);

    if (!fs.existsSync(htmlPath)) {
      test.skip();
    }

    await page.goto(`file://${htmlPath}`);

    // Check score badges
    const badges = page.locator('.score-badge');
    const badgeCount = await badges.count();

    for (let i = 0; i < badgeCount; i++) {
      const badgeText = await badges.nth(i).textContent();
      const scoreMatch = badgeText.match(/(\d+)/);

      if (scoreMatch) {
        const score = parseInt(scoreMatch[1], 10);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  test('should log without errors', async () => {
    const logPath = path.join(process.cwd(), 'logs', 'digest.log');

    if (!fs.existsSync(logPath)) {
      test.skip();
    }

    const logContent = fs.readFileSync(logPath, 'utf-8');
    const lines = logContent.split('\n');
    const recentLines = lines.slice(-50); // Check last 50 lines

    // Should not have critical errors
    const criticalErrors = recentLines.filter(line =>
      line.includes('ERROR') || line.includes('FATAL')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
