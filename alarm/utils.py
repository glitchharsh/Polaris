import requests


class GoogleDistanceApi:

    def __init__(self, origin, destination):
        self.origin = origin
        self.destination = destination
        self.url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        self.method = "GET"
        self.api_key = "AIzaSyDN8JCHCXBJFnYtrUAoYdKqpOLwiklDshI"
        self.format_locations()
        self.add_locations()

    def format_locations(self):
        origin_lat = self.origin["lat"]
        origin_lng = self.origin["lng"]
        dest_lat = self.destination["lat"]
        dest_lng = self.destination["lng"]
        self.origin = f"{origin_lat}%2C{origin_lng}"
        self.destination = f"{dest_lat}%2C{dest_lng}"

    def add_locations(self):
        parameters = f"?origins={self.origin}&destinations={self.destination}"
        parameters += f"&key={self.api_key}"
        self.url += parameters
        print("ran add locs", self.url)

    def send(self):
        self.response = requests.request(self.method, self.url)
        print(self.url)
        return self.response


'''
import requests

url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=24.6850005%2C83.0683519&destinations=24.0847182%2C82.64969459999999&key=AIzaSyDSoBYY3GsgNPJmbNT593TbiDgLYW7xFWc"

payload = {}
headers = {}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
'''
