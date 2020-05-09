# iam.js

This app will detect your visitor's IP address, hostname, location and user agent information using [Hapi.js](https://hapi.dev), [Scooter](https://github.com/hapijs/scooter), [IPinfo](https://ipinfo.io/) and [OpenWeatherMap](https://home.openweathermap.org/).

## Configure

You may set the following environment variables.

* Port number: `PORT` (optional, default value: 3000)
* API token (IPinfo): `API_TOKEN` (optional)
* API token (OpenWeatherMap): `API_TOKEN_OWM` (optional)

## Usage

By default, the Node app will run on port 3000.

```
npm install
node app.js
```

You may test the app using the below `curl`, `http`, `fetch` or `wget` commands.

```
curl http://localhost:3000/
curl http://localhost:3000/ip
curl http://localhost:3000/hostname
curl http://localhost:3000/city
curl http://localhost:3000/country
curl http://localhost:3000/agent
curl http://localhost:3000/weather
```

## Check open ports

You may check for open ports on your host like so:

```
curl http://localhost:3000/port/3000
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/schopenhauer/iam.js.

## License

The module is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
