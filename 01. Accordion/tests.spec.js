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
    })

    it('Displays all articles', async function () {
        await page.goto('http://localhost:3000/')
        const titles = await page.$$eval('.accordion .head span', (titles) => titles.map(x => x.textContent));
        expect(titles).includes('Scalable Vector Graphics')
        expect(titles).includes('Open standard')
        expect(titles).includes('Unix')
        expect(titles).includes('ALGOL')
    })

    it('Tests button functionallity', async function () {
        await page.goto('http://localhost:3000/');
        await page.click('#ee9823ab-c3e8-4a14-b998-8c22ec246bd3')
        const visible = await page.isVisible('.extra p')
        expect(visible).to.be.true
        const buttonText = await page.textContent('#ee9823ab-c3e8-4a14-b998-8c22ec246bd3')
        expect(buttonText).to.equal('Less')
    })

    it('Tests button functionallity', async function () {
        await page.goto('http://localhost:3000/');
        await page.click('.accordion:last-child .head button')
        await page.click('.accordion:last-child .head button')
        const visible = await page.isVisible('.extra p')
        expect(visible).to.be.false
        const buttonText = await page.textContent('#ee9823ab-c3e8-4a14-b998-8c22ec246bd3')
        expect(buttonText).to.equal('More')
    })

});

