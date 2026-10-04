const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:4173/');
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    localStorage.setItem('ludo_device_id', 'test_device');
  });

  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Profile')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));

  const editBtns = await page.$$("button");
  for (const btn of editBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Edit Profile')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));

  const saveBtns = await page.$$("button");
  for (const btn of saveBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Save')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  const playLocal = await page.$$("button");
  for (const btn of playLocal) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Play Local Match')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  const modes = await page.$$("button");
  for (const btn of modes) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('4 Players (Pass & Play)')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  const startBtns = await page.$$("button");
  for (const btn of startBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Start Game')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
  console.log('Screenshot saved to screenshot.png');
})();
