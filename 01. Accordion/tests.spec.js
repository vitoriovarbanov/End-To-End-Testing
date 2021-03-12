const { chromium } = require('playwright-chromium');
const { expect } = require('chai');


let browser, page; // Declare reusable variables
describe('E2E tests', function () {
    this.timeout(6000)
    before(async () => { browser = await chromium.launch(); });
    after(async () => { await browser.close(); });
    beforeEach(async () => { page = await browser.newPage(); });
    afterEach(async () => { await page.close(); });

    it('loads static page', async function () {
        await page.goto('http://localhost:3000/');
        await page.screenshot({ path: `index.png` });
        await browser.close();
    })

    it('Displays all articles', async function(){
        await page.goto('http://localhost:3000/')
        const titles = await page.$$eval('.accordion .head span', (titles) => titles.map(x=>x.textContent));
        expect(titles).includes('Scalable Vector Graphics')
        expect(titles).includes('Open standard')
        expect(titles).includes('Unix')
        expect(titles).includes('ALGOL')
    })

});

