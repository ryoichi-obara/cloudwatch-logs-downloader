const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const moment = require('moment-timezone');

require('dotenv').config();

const profile = process.env.PROFILE;
const logGroupName = process.env.LOG_GROUP_NAME;
const region = process.env.REGION;
const tz = process.env.TIMEZONE;
const filename = process.env.OUTPUT_LOG_FILENAME;

if (profile) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile });
}

const cloudwatchlogs = new AWS.CloudWatchLogs({ region });

const appendFile = async (timestamp, message) => {
  const datetime = moment(timestamp).tz(tz).format('YYYY-MM-DD HH:mm:ss');
  return promisify(fs.appendFile)(path.join(__dirname, filename), `${datetime} ${message}`);
};

const fileoutLogs = async (logStreamName) => {
  const logEvents = await cloudwatchlogs.getLogEvents({ logGroupName, logStreamName }).promise();
  return Promise.all(
    logEvents.events.map(event => appendFile(event.timestamp, event.message)),
  );
};

(async () => {
  const res = await cloudwatchlogs.describeLogStreams({ logGroupName }).promise();
  await Promise.all(
    res.logStreams.map(logStream => fileoutLogs(logStream.logStreamName)),
  );
})();
