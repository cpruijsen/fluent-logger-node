'use strict';
/* globals describe, it */
/* eslint node/no-unpublished-require: ["error", {"allowModules": ["async", "chai", "winston"]}] */
const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const winstonSupport = require('../lib/winston');
const winston = require('winston');
const runServer = require('../lib/testHelper').runServer;

describe('winston', () => {
  describe('name', () => {
    it('should be "fluent"', (done) => {
      expect((new winstonSupport()).name).to.be.equal('fluent');
      done();
    });
  });

  describe('transport', () => {
    it('should send log records', (done) => {
      runServer({}, {}, (server, finish) => {
        const logger = winston.createLogger({
          format: winston.format.combine(
            winston.format.splat(),
            winston.format.simple()
          ),
          transports: [
            new winstonSupport({tag: 'debug', port: server.port})
          ]
        });

        logger.info('foo %s', 'bar', {x: 1});
        setTimeout(() => {
          finish((data) => {
            expect(data[0].tag).to.be.equal('debug');
            expect(data[0].data).exist;
            expect(data[0].time).exist;
            expect(data[0].data.message).to.be.equal('foo bar');
            expect(data[0].data.level).to.be.equal('info');
            expect(data[0].data.x).to.be.equal(1);
            done();
          });
        }, 1000);
      });
    });

    it('should honor enableReconnect', (done) => {
      const transport = new winstonSupport('debug', {
        enableReconnect: false,
        reconnectInterval: 100
      });
      expect(transport.sender.enableReconnect).to.be.equal(false);
      expect(transport.sender._eventEmitter.listeners('error').length).to.be.equal(0);
      done();
    });
  });

  describe('types', () => {
    it('should include enableReconnect in Options', (done) => {
      const dts = fs.readFileSync(path.join(__dirname, '../lib/index.d.ts'), 'utf8');
      expect(dts).to.match(/interface Options \{[\s\S]*enableReconnect\?:\s*boolean/);
      done();
    });
  });
});
