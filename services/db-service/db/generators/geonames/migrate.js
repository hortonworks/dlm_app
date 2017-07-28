const fs = require('fs');
const parse = require('csv-parse');
const transform = require('stream-transform');

const parser = parse({
  delimiter: '\t',
  // relax: true,
  // relax_column_count: true,
  // skip_empty_lines: true,
  // escape: false,
  quote: false,
  trim: true,
});
let i = 0;
const transformer = transform(function(record, callback){
  // setTimeout(function(){
    i++;
    callback(null, `,(${record[0]}, '${record[2].replace(/'/g, "''")}', '${record[8]}', ${record[4]}, ${record[5]})`+'\n');
  // }, 500);
}, {parallel: 10});

const input = fs.createReadStream('cities1000-2017-04-24.txt', {'encoding': 'utf8'});
const output = fs.createWriteStream('../migrations/locations.sql', {'encoding': 'utf8'});
input.pipe(parser).pipe(transformer).pipe(output);