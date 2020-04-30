'use strict';

require('dotenv').config();

const net = require('net');
const Hapi = require('@hapi/hapi');

const portsNames = require('./ports.json');
const userAgents = ['curl', 'Wget', 'HTTPie', 'fetch'];
const lineWrap = "\n";

const start = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  await server.register({
    plugin: require('@hapi/inert'),
  });

  await server.register({
    plugin: require('hapi-geo-locate'),
    options: process.env.TOKEN ? { authToken: process.env.TOKEN } : {}
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
      return req.location;
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
    path: '/p/{port}',
    handler: (req, h) => {
      let port = req.params.port;
      let ip = req.location.ip;
      let payload = {
        port: port,
        description: portsNames.ports[port].description || portsNames.ports[port][0].description,
        ip: ip,
      }
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
