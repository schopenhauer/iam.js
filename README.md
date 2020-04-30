# iam.js

This app will detect your visitor's IP address, hostname and location using [Hapi.js](https://hapi.dev) and [IPinfo](https://ipinfo.io/).

## Configure

You may set the following environment variables.

* Port number: `PORT` (default value: 3000)
* Authentication token: `TOKEN` (optional)

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
curl http://localhost:3000/p/3000
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/schopenhauer/iam.js.

## License

The module is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
