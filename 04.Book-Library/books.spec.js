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
            await page.goto(host)
            await page.click('#loadBooks')

            const results = await page.$$eval('tbody', (value) => value.map(x => x.textContent))
            expect(results[0]).to.includes('Harry Potter and the Philosopher\'s Stone\n')
            expect(results[0]).to.includes('C# Fundamentals')
        })
        it('Add new books', async function(){
            const title = 'Crazy Book'
            const author = 'Crazy Author'
            page.route(host, route => route.fulfill(json({ author: 'Best Author', title: 'LOALA', _id: '2214512' })));
            await page.goto(host)
            const visible = await page.isVisible('#createForm')
            expect(visible).to.be.true
            await page.fill('[name="title"]', title)
            await page.fill('[name="author"]', author)

            const [request] = await Promise.all([
                page.waitForRequest(request => request.url().includes('/jsonstore/collections/books') && request.method() === 'POST'),
                page.click('text=Submit')
            ])
            expect(request.method()).to.equal('POST');
            const postData = JSON.parse(request.postData());
            expect(postData.author).to.equal(author);
            expect(postData.title).to.equal(title) 

        })
        it('Edit Book')

    })



});