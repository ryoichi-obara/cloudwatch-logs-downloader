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
  let nextToken;
  do {
    const logEvents = await cloudwatchlogs.getLogEvents({ logGroupName, logStreamName, nextToken }).promise();
    console.log(logEvents.nextForwardToken);
    await Promise.all(
      logEvents.events.map(event => appendFile(event.timestamp, event.message)),
    );
    if (nextToken && nextToken !== logEvents.nextForwardToken) {
      nextToken = logEvents.nextForwardToken;
    } else {
      break;
    }
  } while (true);
};

(async () => {
  let nextToken;
  do {
    const res = await cloudwatchlogs.describeLogStreams({ logGroupName, nextToken }).promise();
    console.log(`--- ${res.nextToken}`);
    res.logStreams.forEach(async (logStream) => {
      await fileoutLogs(logStream.logStreamName);
    });
    if (nextToken === res.nextToken) {
      break;
    }
    ({ nextToken } = res);
  } while (true);
})();
