import fetch from "node-fetch";
import jsdom from "jsdom";
import {URL} from "url";

const base =
  "https://www.onlyinboards.com/Used-ski-boats.aspx?MakerName=1&YearFrom=2018&YearTo=&PriceFrom=&PriceTo=&Model=221&ZIP=&Distance=";
(async function () {
  const res = await fetch(base);
  const {
    window: {document},
  } = new jsdom.JSDOM(await res.text());

  const boats = [];
  for (const link of document.querySelectorAll(".info a"))
    boats.push(await crawl(link.href));
  console.log(boats);

  const body = JSON.stringify({records: boats.map((fields) => ({fields}))});
  console.log(body);
  const save = await fetch(
    "https://api.airtable.com/v0/appM27XwR5pkr8aNS/Boats",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body,
    }
  );
  console.log(await save.text());
})();

async function crawl(path) {
  const url = new URL(path, base);
  const [, id] = path.match(/-(\d+).aspx$/);
  const res = await fetch(url);
  const html = await res.text();
  const {
    window: {document},
  } = new jsdom.JSDOM(html);

  const selectors = {
    name: "[itemprop='name']",
    price: ".price strong span",
    listed: ".datelisted strong",
    engine: ".boat-info li:first-child strong",
    hours: ".col-right .boat-info li.hours strong",
    status: ".hours strong font",
    location: ".location strong",
    description: "[itemprop='description'] p",
    year: ".year strong",
    make: ".make strong",
    model: ".model strong",
  };

  return {
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
}
