import requests

url = "http://localhost:8000/auth/register"
data = {
    "email": "testrunner007@gmail.com",
    "password": "testpassword123",
    "full_name": "Test Runner",
    "age": 25,
    "gender": "Male"
}

try:
    print(f"Making POST request to {url}...")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Connection Error: {e}")
