'use strict';

require('dotenv').config();

const net = require('net');
const axios = require('axios');
const Hapi = require('@hapi/hapi');
const scooter = require('@hapi/scooter');

const portsNames = require('./ports.json');
const userAgents = ['curl', 'Wget', 'HTTPie', 'fetch'];
const lineWrap = '\n';

const start = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  await server.register({
    plugin: require('@hapi/inert'),
  });

  await server.register({
    plugin: require('@hapi/scooter'),
  });

  await server.register({
    plugin: require('hapi-geo-locate'),
    options: process.env.API_TOKEN ? { authToken: process.env.API_TOKEN } : {}
  });

  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: {
      directory: {
        path: 'public'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (req, h) => {
      return {
        ...req.location,
        agent: req.headers['user-agent']
      };
    }
  });

  server.route({
    method: 'GET',
    path: '/agent',
    handler: (req, h) => {
      return {
        ...req.plugins.scooter
      };
    }
  });

  server.route({
    method: 'GET',
    path: '/{key}',
    handler: (req, h) => {
      const value = req.location[req.params.key];
      if (value) {
        if (userAgents.some(u => req.headers['user-agent'].includes(u))) {
          return value + lineWrap;
        } else {
          return value;
        }
      } else {
        return null;
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/weather',
    handler: async (req, h) => {
      if (req.location.loc && process.env.API_TOKEN_OWM) {
        const loc = req.location.loc.split(',');
        const lat = loc[0];
        const lon = loc[1];
        return new Promise(resolve => {
          let url = 'https://2api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + process.env.API_TOKEN_OWM;
          axios.get(url).then(function (repsonse) {
            resolve(repsonse.data);
          }).catch((error) => {
            resolve(error);
            console.log(error);
          });
        });
      } else {
        return null;
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/port/{port}',
    handler: (req, h) => {
      let port = req.params.port;
      let payload = {
        port: port,
        ip: req.location.ip,
        description: portsNames.ports[port] ? portsNames.ports[port].description || portsNames.ports[port][0].description : null
      };
      return new Promise(resolve => {
        const socket = new net.Socket;
        socket.setTimeout(500);
        socket.connect(payload.port, payload.ip, () => {
          resolve(h.response({ open: true, ...payload }));
        });
        socket.on('timeout', () => {
          resolve(h.response({ open: false, ...payload }));
        });
        socket.on('error', () => {
          resolve(h.response({ open: false, ...payload }));
        });
      });
    }
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

start();
