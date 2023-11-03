from django.shortcuts import render, HttpResponse
from django.views.generic import View
from django.http import JsonResponse, QueryDict
from .utils import GoogleDistanceApi
from json import loads
from .models import Coordinate, Alarm
from main.settings import GCLOUD_KEY

class Index(View):
    def get(self, request):
        conf = {"key": GCLOUD_KEY}
        return render(request, 'alarm/index.html', conf)

    def post(self, request):
        try:
            place = request.POST['place']
            medium = request.POST['medium']
            destination = {
                'latitude': request.POST['destination[lat]'],
                'longitude': request.POST['destination[lng]'],
            }
            origin = {
                'latitude': request.POST['origin[lat]'],
                'longitude': request.POST['origin[lng]']
            }
        except Exception:
            return JsonResponse({"error": "data not found"}, status=400)
        dest_qs = Coordinate.objects.filter(**destination)
        if len(dest_qs) > 0:
            destination_object = dest_qs[0]
        else:
            destination_object = Coordinate.objects.create(**destination)
        origin_qs = Coordinate.objects.filter(**origin)
        if len(origin_qs) > 0:
            origin_object = origin_qs[0]
        else:
            origin_object = Coordinate.objects.create(**origin) 
        if len(place) > 50:
            place = place[:49]
        alarm_object = Alarm.objects.create(origin=origin_object, destination=destination_object, place=place, medium=medium)
        # destination_object.alarm = alarm_object
        # destination_object.save()
        # origin_object.alarm = alarm_object
        # origin_object.save()
        return JsonResponse({"id": alarm_object.pk}, status=200)

    def patch(self, request):
        try:
            data = QueryDict(request.body)
            alarm_id = data["id"]
            alarm_object = Alarm.objects.get(id=alarm_id)
        except Exception as e:
            print(e)
            return JsonResponse({"error": "data not found"}, status=400)
        alarm_object.triggered = True
        alarm_object.save()
        return JsonResponse({"id": alarm_object.pk}, status=200)


    def put(self, request):
        destination = {
            'lat': request.POST['destination[lat]'],
            'lng': request.POST['destination[lng]'],
        }
        origin = {
            'lat': request.POST['origin[lat]'],
            'lng': request.POST['origin[lng]']
        }
        resp = GoogleDistanceApi(origin, destination).send()
        data = loads(resp.text)
        data = data["rows"][0]["elements"]
        return JsonResponse({"status": 200, "distance": data[0]["distance"], "duration": data[0]["duration"]})
        
