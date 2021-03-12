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
        it('loads static page', async function () {
            await page.goto('http://localhost:3000/');
            await page.screenshot({ path: `index.png` });
        })

        it('All messages are loaded properly', async function () {
            await page.goto(host)

            await page.click('#refresh')
            const text = await page.$$eval('#messages ', (value) => value.map(x => x.value));
            expect(text[0]).to.includes('Spami: Hello, are you there?\n')
        })

        it.only('Send Message', async function () {
            const author = 'Hacker'
            const content = 'Hack them all'
            page.route(host, route => route.fulfill(json({ author: 'Someone', content: 'YOYOY', _id: '2214512' })));

            await page.goto(host)

            await page.fill('#author', author)
            await page.fill('#content', content)

            const [request] = await Promise.all([
                page.waitForRequest(request => request.url().includes('/jsonstore/messenger') && request.method() === 'POST'),
                page.click('#submit')
            ])

            const postData = JSON.parse(request.postData());
            expect(postData.author).to.equal(author);
            expect(postData.content).to.equal(content); 
        })
    })



});
