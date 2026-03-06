import urllib.request
import json

url = "https://mfml2qfrze.execute-api.eu-west-3.amazonaws.com/api/ml/emotion"
data = json.dumps({
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    response = urllib.request.urlopen(req)
    print("SUCCESS", response.read().decode())
except urllib.error.HTTPError as e:
    print(f"FAILED: {e.code}")
    print(e.read().decode())
