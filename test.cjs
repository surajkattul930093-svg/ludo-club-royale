const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  console.log('Navigating...');
  await page.goto('http://localhost:3002/');
  
  // wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking online match 2 player...');
  const elements = await page.$x("//button[contains(., 'Online Match (2 Player)')]");
  if (elements.length > 0) {
    await elements[0].click();
    console.log('Clicked! Waiting for matchmaking...');
    await new Promise(r => setTimeout(r, 4000));
  } else {
    console.log('Button not found');
  }

  await browser.close();
})();
