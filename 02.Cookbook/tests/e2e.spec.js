//@ts-check
const { chromium } = require('playwright-chromium');
const { expect } = require('chai');
const mockData = require('./mock-data.json')

const endpoints = {
    recipes: '/data/recipes?select=_id%2Cname%2Cimg',
    count: '/data/recipes?count',
    recent: '/data/recipes?select=_id%2Cname%2Cimg&sortBy=_createdOn%20desc',
    recipe_by_id: '/data/recipes/3987279d-0ad4-4afb-8ca9-5b256ae3b298',
    register: '/users/register',
    login: '/users/login',
    logout: '/users/logout',
    create: '/data/recipes'
}


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


let browser;
let context;
let page;

describe('E2E tests', function () {
    this.timeout(6000);

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

    describe('Catalog', () => {
        it('Displays initial data', async () => {
            page.route('**' + endpoints.recipes + '**', (route) => {
                route.fulfill(json(mockData.list))
            })
            await page.goto('http://localhost:3000');
            await page.waitForSelector('article')
            const titles = await page.$$eval('h2', titles => titles.map(x => x.textContent))
            expect(titles[0]).to.contains('Easy Lasagna')
            expect(titles[1]).to.contains('Grilled Duck Fillet')
            expect(titles[2]).to.contains('Roast Trout')
        })
    })

    describe('Authentication', () => {
        it('Register', async () => {
            const endpoint = '**' + endpoints.register;
            const email = 'john@abv.bg';
            const password = '123456';

            page.route(endpoint, route => route.fulfill(json({ _id: '0001', email, accessToken: 'AAAA' })));

            await page.goto('http://localhost:3000');
            await page.click('text=Register');

            await page.waitForSelector('form');

            await page.fill('[name="email"]', email);
            await page.fill('[name="password"]', password);
            await page.fill('[name="rePass"]', password);

            const [response] = await Promise.all([
                page.waitForResponse(endpoint),
                page.click('[type="submit"]')
            ]);

            const postData = JSON.parse(response.request().postData());
            expect(postData.email).to.equal(email);
            expect(postData.password).to.equal(password);
        })

        it('Login', async () => {
            const endpoint = '**' + endpoints.login;
            const email = 'peter@abv.bg';
            const password = '123456'
            page.route('**' + endpoints.login, router => router.fulfill(json({ _id: '2225', email, accessToken: 'tokenAAA' })))

            await page.goto('http://localhost:3000')
            await page.click('#loginLink');

            await page.waitForSelector('form')

            await page.fill('[name="email"]', email)
            await page.fill('[name="password"]', password)

            await page.waitForTimeout(100)

            const [response] = await Promise.all([
                page.waitForResponse(endpoint),
                page.click('[type="submit"]')
            ])

            const postData = JSON.parse(response.request().postData())
            expect(postData.email).to.equal(email);
            expect(postData.password).to.equal(password);
        })
    })

});
