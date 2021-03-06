import Promise from 'polyfill-promise';
import { getLunch, getSlackNames } from './getSheets';
import { getNextLunch, getDateColumn } from './getNextLunchDate';
import { formatForPrivate, parseNames } from './parseNames';
import { postToSlack } from './postToSlack';
import { returnSlackNames } from './returnSlackNames';

console.log("running private reminder");

let namesObj = {};

const parseData = (data) => {
  const dates = getDateColumn(data);
  const next = getNextLunch(dates);
  const names = formatForPrivate(data, next);
  const slackNames = returnSlackNames(parseNames(data, next), namesObj);
  /* eslint max-len: "off" */
  const msg = `
    You are scheduled to help with lunch on Friday with:
    ${names}
    If you are unable to do so please find a replacement and update the spreadsheet.

    ${process.env.sheetUrl}
  `;

  slackNames.forEach((helper) => {
    postToSlack(`@${helper}`, msg);
  });
};

const getData = () => {
  const namesAndData = [getLunch(), getSlackNames()];

  Promise.all(namesAndData).then((x) => {
    namesObj = x[1];
    parseData(x[0]);
  });
};

const date = new Date();
// wednesday
if (date.getDay() === 3) {
  getData();
}
