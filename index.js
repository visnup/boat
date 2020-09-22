import puppeteer from "puppeteer";

(async function () {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1280, height: 900},
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
  );
  await page.goto(
    "https://www.onlyinboards.com/Used-ski-boats.aspx?MakerName=1&YearFrom=2018&YearTo=&PriceFrom=&PriceTo=&Model=221&ZIP=&Distance="
  );
  const links = await page.$(".info a");
  console.log(links);
  await page.screenshot({path: `results.png`});
  browser.close();
})();
