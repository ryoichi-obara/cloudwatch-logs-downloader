# CloudWatchLogs Downloader

Save CloudWatchLogs to local file.

## Environment variables

* ``PROFILE``: AWS Account profile name (To use default, comment-out 14-15th line.)
* ``LOG_GROUP_NAME``: CloudWatch Log Groups Name, e.g. ``/aws/lambda/my-lambda-function``
* ``REGION``
* ``TIMEZONE``: For moment-timezone. e.g. ``Asia/Tokyo``
* ``OUTPUT_LOG_FILENAME``: Filename to save logs. e.g. ``my-lambda-function.log``

## Run

```
npm run main
```
