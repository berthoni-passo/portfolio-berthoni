import boto3, json, time
import sys
# force utf8 buffer
sys.stdout.reconfigure(encoding='utf-8')

client = boto3.client('logs')
end = int(time.time() * 1000)
start = int((time.time() - 3600) * 1000)

logs = client.filter_log_events(logGroupName='/aws/lambda/portfolio-backend-api', startTime=start, endTime=end)
events = logs.get('events', [])
events.sort(key=lambda x: x['timestamp'], reverse=True)

with open('latest.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(events[:100], indent=2))
print("Done")
