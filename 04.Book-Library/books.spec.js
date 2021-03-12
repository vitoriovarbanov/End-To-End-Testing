const { chromium } = require('playwright-chromium');
const { expect } = require('chai');
let browser, page; // Declare reusable variables
const host = 'http://localhost:3000';

function json(data) {
    return {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
}

describe('E2E tests', function () {
    this.timeout(6000)
    before(async () => {
        browser = await chromium.launch({ headless: false, slowMo: 500 });
        //browser = await chromium.launch();
    });

    after(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();

        // block intensive resources and external calls (page routes take precedence)
        await context.route('**/*.{png,jpg,jpeg}', route => route.abort());
        await context.route(url => {
            return url.hostname != 'localhost';
        }, route => route.abort());

        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });

    describe('Load Message', function () {
        it('Loads static page', async function () {
            await page.goto('http://localhost:3000/');
            await page.screenshot({ path: `index.png` });
        })

            //`http://localhost:3030/jsonstore/collections/books`
        it('Load books', async function () {
            await page.goto('http://localhost:3000/')
            await page.click('#loadBooks')

            const results = await page.$$eval('tbody', (value) => value.map(x => x.textContent))
            expect(results[0]).to.includes('Harry Potter and the Philosopher\'s Stone\n')
            expect(results[0]).to.includes('C# Fundamentals')
        })
    })



});