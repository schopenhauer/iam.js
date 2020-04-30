const fs = require('fs');
const got = require('got');
const parseString = require('xml2js').parseString;

const URL = 'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xml';

let json = {};

(async () => {
    try {
        const response = await got(URL);
        //var xml = fs.writeFileSync('ports.xml', response.body);
        //console.log(response)
        parseString(response.body, function (err, result) {
          let ports = result.registry.record;
          for (port of ports) {
            json[port.number] = {
              name: port.name,
              description: port.description
            }
          }
          var xml = fs.writeFileSync('ports_v2.json', JSON.stringify(json));
          //console.dir(ports);
        });
    } catch (error) {
        console.log(error);
    }
})();
