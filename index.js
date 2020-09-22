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
  for (const link of document.querySelectorAll(".info a")) {
    console.log(link.href);
    boats.push(await boat(link.href));
  }

  console.log(boats);
})();

async function boat(path) {
  const url = new URL(path, base);
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
    ...Object.fromEntries(
      Object.entries(selectors).map(([key, selector]) => [
        key,
        (document.querySelector(selector) || {innerHTML: ""}).innerHTML
          .trim()
          .replace(/\s+/g, " "),
      ])
    ),
    url: url.toString(),
  };
}
