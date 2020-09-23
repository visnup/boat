import fetch from "node-fetch";
import jsdom from "jsdom";
import {URL} from "url";

const base =
  "https://www.onlyinboards.com/Used-ski-boats.aspx?MakerName=1&YearFrom=2018&YearTo=&PriceFrom=&PriceTo=&Model=221&ZIP=&Distance=";
const userAgent = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
  },
};
(async function () {
  const res = await fetch(base, userAgent);
  const {
    window: {document},
  } = new jsdom.JSDOM(await res.text());

  for (const link of document.querySelectorAll(".info a"))
    await save(await crawl(link.href));
})();

async function crawl(path) {
  const url = new URL(path, base);
  const [, id] = path.match(/-(\d+).aspx$/);
  const res = await fetch(url, userAgent);
  const html = await res.text();
  const {
    window: {document},
  } = new jsdom.JSDOM(html);

  const selectors = {
    name: "[itemprop='name']",
    price: ".price strong span",
    listed: ".datelisted strong",
    engine: ".col-right .boat-info li:first-child strong",
    hours: ".col-right .boat-info li.hours strong",
    status: ".hours strong font",
    location: ".location strong",
    description: "[itemprop='description'] p",
    year: ".year strong",
    make: ".make strong",
    model: ".model strong",
  };

  const boat = {
    id,
    url: url.toString(),
    fetched: new Date(),
    ...Object.fromEntries(
      Object.entries(selectors).map(([key, selector]) => [
        key,
        (document.querySelector(selector) || {innerHTML: ""}).innerHTML
          .trim()
          .replace(/\s+/g, " "),
      ])
    ),
  };
  boat.price = +boat.price.replace(/\D/g, "") || null;
  boat.hours = +boat.hours;

  return boat;
}

async function save(fields) {
  const res = await fetch(
    "https://api.airtable.com/v0/appM27XwR5pkr8aNS/Boats",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({records: [{fields}]}),
    }
  );
  console.log(await res.text());
}
