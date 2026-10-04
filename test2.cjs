const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  console.log('Navigating...');
  await page.goto('http://localhost:3002/');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Set localStorage to simulate saved profile
  await page.evaluate(() => {
    localStorage.setItem('ludo_device_id', 'test_device');
  });

  // We actually need to click the profile and save it to trigger updateProfile!
  console.log('Clicking Profile...');
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Profile')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicking Save Profile...');
  const saveBtns = await page.$$("button");
  for (const btn of saveBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Save Profile')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicking Play Local Match...');
  const playLocal = await page.$$("button");
  for (const btn of playLocal) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Play Local Match')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicking 4 Players (Pass & Play)...');
  const modes = await page.$$("button");
  for (const btn of modes) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('4 Players (Pass & Play)')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicking Start Game...');
  const startBtns = await page.$$("button");
  for (const btn of startBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Start Game')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));

  await browser.close();
})();
