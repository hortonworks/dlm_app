var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./cities.json', 'utf8'));

var stream = fs.createWriteStream("./locations.sql");
stream.once('open', function(fd) {
  obj
  .filter(cLocation =>  /^[\x00-\xFF]*$/.test(cLocation.name) && cLocation.country.length > 0)
  .forEach(cLocation => {
    stream.write(`INSERT INTO dataplane.dp_locations (country, city, latitude, longitude) VALUES ('${cLocation.country}', '${cLocation.name}', ${cLocation.lat}, ${cLocation.lng});\n`);
  });
  stream.end();
});
// fails for cLocation = { country: 'AF', name: 'شرن', lat: '33.175678', lng: '68.730449' } and hence filtered out.