import datetime
import json
from collections import OrderedDict
import progressbar
from shapely.geometry import Point
from functools import partial
import pyproj
from shapely.ops import transform


import numpy as np
import sklearn
import tpot
import joblib
from sklearn.metrics import classification_report
from sklearn.neighbors import KNeighborsRegressor
def truncate(f, n):
    '''Truncates/pads a float f to n decimal places without rounding'''
    s = '{}'.format(f)
    if 'e' in s or 'E' in s:
        return '{0:.{1}f}'.format(f, n)
    i, p, d = s.partition('.')
    return '.'.join([i, (d+'0'*n)[:n]])


crime_file = json.load(open('crime_json_all_years.json'))

start_year = 2015
end_year = 2017

min_lat = 480316
max_lat = 492665
min_long = 5455114
max_long = 5460299

#in: epsg:26910
#out: epsg:4326
min_point = Point(min_lat, min_long)
max_point = Point(max_lat, max_long)
project = partial(
    pyproj.transform,
    pyproj.Proj(init='epsg:26910'),
    pyproj.Proj(init='epsg:4326')
)
min_point = transform(project, min_point)
max_point = transform(project, max_point)
min_lat = float(min_point.x)
min_long = float(min_point.y)
max_lat = float(max_point.x) + .2
max_long = float(max_point.y) + .2


iterate = .01
index = 0
bar = progressbar.ProgressBar(max_value=len(np.arange(min_lat, max_lat, iterate)) * len(np.arange(min_long, max_long, iterate
                                                                                                  )) * len(range(start_year, end_year + 1)) * len(range(12)) * len(range(7)) * len(range(2)))
lat_long_dict = OrderedDict()
for lat in np.arange(min_lat, max_lat, iterate):
    for longitude in np.arange(min_long, max_long, iterate):
        for year in range(start_year, end_year + 1):
            for month_group in range(12):
                for day_of_week in range(7):
                    for hour in range(2):
                        index += 1
                        bar.update(index)
                        lat_long_dict[float(truncate(lat, 2)), float(truncate(longitude, 2)), year, month_group, day_of_week, hour] = 0



#
# # num_rows = (end_year - start_year + 1) * 12 * 7 * 24
# # num_cols = 6 #lat, long, year, month, day of week, hour
# # training_arr = np.zeros((num_rows, num_cols))
# # for year in range(start_year, end_year):
# #     row = (year - start_year) * 12 * 7 * 24
# #     for month in range(12):
# #         row += month * 7 * 24
# #         for day in range(7):
# #             row += day * 24
# #             for hour in range(24):
# #                 row += hour
# #
#
print("Grabbing Crimes")
bar = progressbar.ProgressBar(max_value=len(crime_file['features']))
for index, crime in enumerate(crime_file['features']):
    year = crime['properties']['YEAR']
    bar.update(index)
    if year >= start_year and year <= end_year:
        month = int(crime['properties']['MONTH'])
        day = crime['properties']['DAY']
        hour = int(crime['properties']['HOUR'])
        if 6 <= hour <= 18:
            hour = 0
        else:
            hour = 1
        day_of_week = datetime.datetime(year, int(month), int(day)).weekday()
        # day_of_week = 0 if day_of_week < 5 else 1
        row_offset = (year - start_year) * 12 * 7 * 24
        row = row_offset + int(month) + int(day_of_week)
        point = Point(crime['properties']['X'], crime['properties']['Y'])
        point = transform(project, point)
        latitude = float(truncate(float(point.x), 2))
        longitude = float(truncate(float(point.y), 2))
        if (min_lat <= latitude <= max_lat) and (min_long <= longitude <= max_long):
            try:
                lat_long_dict[latitude, longitude, year, int(month), day_of_week, hour] += 1
            except KeyError:
                pass
#
print('starting training...')
data = np.array(list(lat_long_dict.keys()))
target = np.array(list(lat_long_dict.values()))
# X_train, X_test, y_train, y_test = sklearn.model_selection.train_test_split(data, target)
# regressor = KNeighborsRegressor(n_jobs=-1)
# regressor.fit(X_train, y_train)
# expected = y_test
# predicted = regressor.predict(X_test)
# joblib.dump(regressor, 'k_neighbors.pkl')
# print(classification_report(expected, predicted))

print('Training')
crime_classifier = tpot.TPOTRegressor(n_jobs=-1, verbosity=3, generations=50, population_size=50)
crime_classifier.fit(data, target)
crime_classifier.export('crime_predictor_classifier.py')

