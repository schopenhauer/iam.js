'use strict';

require('dotenv').config();

const net = require('net');
const axios = require('axios');
const Hapi = require('@hapi/hapi');
const scooter = require('@hapi/scooter');

const portsNames = require('./ports.json');
const userAgents = ['curl', 'Wget', 'HTTPie', 'fetch'];
const lineWrap = '\n';

const API_TOKEN = process.env.API_TOKEN;
const API_TOKEN_OWM = process.env.API_TOKEN_OWM;
const SOCKET_TIMEOUT = 500;

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
    options: API_TOKEN ? { authToken: API_TOKEN } : {}
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
      if (req.location.loc && process.env.API_TO2KEN_OWM) {
        return new Promise(resolve => {
          const loc = req.location.loc.split(',');
          let url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + loc[0] + '&lon=' + loc[1] + '&appid=' + API_TOKEN_OWM + '&units=metric';
          axios.get(url).then(function (repsonse) {
            resolve(repsonse.data);
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
      let description = portsNames.ports[port] ? portsNames.ports[port].description || portsNames.ports[port][0].description : null;
      let payload = {
        port: port,
        ip: req.location.ip,
        description: description,
      };
      return new Promise(resolve => {
        const socket = new net.Socket;
        socket.setTimeout(SOCKET_TIMEOUT);
        socket.connect(payload.port, payload.ip, () => {
          resolve({ open: true, ...payload });
        });
        socket.on('timeout', () => {
          resolve({ open: false, ...payload });
        });
        socket.on('error', () => {
          resolve({ open: false, ...payload });
        });
      });
    }
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

start();
