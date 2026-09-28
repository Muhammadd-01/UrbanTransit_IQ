import joblib
test_data = joblib.load('backend/trained_models/test_data.csv')
print(type(test_data))
if isinstance(test_data, list):
    print(len(test_data))
    print(test_data[0])
else:
    print(test_data.shape, test_data.columns)
