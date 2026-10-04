const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

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

  console.log('Clicking Online Match (2 Player)...');
  const onlineBtn = await page.$$("button");
  for (const btn of onlineBtn) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Online Match (2 Player)')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));

  await browser.close();
})();
