import puppeteer, { Browser, Page } from 'puppeteer'
import * as fs from 'fs'

interface Config {
  page: string,
  dailyUsagePage: string,
  accountUsername: string | undefined,
  accountPassword: string | undefined
}

const config: Config = {
  page: 'https://logowanie.tauron-dystrybucja.pl/logged-out?service=https://elicznik.tauron-dystrybucja.pl',
  dailyUsagePage: '/energia',
  accountUsername: process.env.USERNAME,
  accountPassword: process.env.PASSWORD
}

async function initialize (): Promise<{ page: Page, browser: Browser }> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(config.page, { waitUntil: 'networkidle0' })

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })

  return { page, browser }
}

async function login (page: Page): Promise<void> {
  await page.type('#username1', config.accountUsername!)
  await page.type('#password1', config.accountPassword!)

  const selector = '.button-pink'
  await page.click(selector)
  await page.waitForSelector('.energyConsum')
}

async function navigateToDailyUsage (page: Page): Promise<void> {
  await page.click(`a[href='${config.dailyUsagePage}']`)
  await page.waitForSelector('canvas')
}

async function getUsage (page: Page): Promise<number> {
  const totalUsage = await page.$('#consum')
  const textContent = await (await totalUsage?.getProperty('textContent'))?.jsonValue()
  const value = textContent?.replace('kWh', '') ?? '-1'

  return Number(value.replace(',', '.'))
}

async function teardown (browser: Browser): Promise<void> {
  await browser.close()
}

async function debug (page: Page): Promise<void> {
  const pageContent = await page.content()
  await fs.writeFile('page-content.html', pageContent, (err) => {
    if (err != null) {
      console.log(err)
    }
  })

  await page.screenshot({
    path: 'page.png'
  })
}

function ValidateConfig (config: Config) {
  if (config.accountUsername == null) {
    throw new Error('Username empty')
  }
  if (config.accountPassword == null) {
    throw new Error('Password empty')
  }
}

export default async () => {
  ValidateConfig(config)

  const controlls = await initialize()
  await login(controlls.page)
  await debug(controlls.page)
  await navigateToDailyUsage(controlls.page)
  const usage = await getUsage(controlls.page)
  console.log(`Usage: ${usage}`)

  await teardown(controlls.browser)
  return usage
}
