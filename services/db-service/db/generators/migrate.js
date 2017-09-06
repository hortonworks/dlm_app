/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

var fs = require('fs');
const Papa = require('papaparse');

const output = fs.createWriteStream('../migrations/locations.sql', {'encoding': 'utf8'});
output.write(`INSERT INTO dataplane.locations
(city, province, country, iso2, latitude, longitude)
VALUES
 `);
let isFirst = true;
var file = 'simplemaps-worldcities-basic.csv';

var content = fs.readFileSync(file, { encoding: 'utf-8' });
Papa.parse(content, {
  header: true,
  skipEmptyLines: true,
  step: rows => {
    rows.data.forEach(cRow => {
      output.write(`${isFirst ? '': ','}('${cRow['city_ascii'].replace(/'/g, "''")}', '${cRow['province'].replace(/'/g, "''")}', '${cRow['country'].replace(/'/g, "''")}', '${cRow['iso2']}', ${cRow['lat']}, ${cRow['lng']})\n`);
      isFirst = false;
    });
  },
  // error: (err, file, inputElem, reason) => console.error(err),
	complete: results =>  {
    output.write(';');
    output.end();
    console.log("All done!");
	}
});