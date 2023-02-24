import puppeteer from 'puppeteer'
import fs from 'fs'

const config = {
  page: 'https://logowanie.tauron-dystrybucja.pl/logged-out?service=https://elicznik.tauron-dystrybucja.pl',
  username: '',
  password: ''
};

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(config.page, { waitUntil: 'networkidle0' })

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })

  // Type into search box
  await page.type('#username1', config.username)
  await page.type('#password1', config.password)

  // Wait and click on first result
  const pageContent = await page.content()
  await fs.writeFile('page-content.html', pageContent, (err) => console.log(err))

  const selector = '.button-pink'
  await page.click(selector)

  await page.screenshot({
    path: 'page.png'
  })

  const emailSelector = await page.waitForSelector('.not-only-navigation')

  const fullTitle = await emailSelector!.evaluate(el => el.textContent)

  // Print the full title
  console.log('Logged user: "%s".', fullTitle)

  await browser.close()
})()
