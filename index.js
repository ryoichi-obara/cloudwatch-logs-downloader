const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
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

cloudwatchlogs.describeLogStreams({ logGroupName }, (err, res) => {
  // console.log(res);

  for (const logStream of res.logStreams) {
    console.log(logStream.logStreamName);

    cloudwatchlogs.getLogEvents({ logGroupName, logStreamName: logStream.logStreamName }, (error, events) => {
      for (const event of events.events) {
        const datetime = moment(event.timestamp).tz(tz).format('YYYY-MM-DD HH:mm:ss');
        // console.log(`${datetime} ${event.message}`);
        fs.appendFileSync(path.join(__dirname, filename), `${datetime} ${event.message}`);
      }
    });
  }
});
