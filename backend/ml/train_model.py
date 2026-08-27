import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn import metrics
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

exercise = pd.read_csv(os.path.join(BASE_DIR, "exercise.csv"))
calories = pd.read_csv(os.path.join(BASE_DIR, "calories.csv"))

dataset = pd.concat([exercise, calories["Calories"]], axis=1)
dataset.replace({"Gender": {"male": 0, "female": 1}}, inplace=True)
dataset["Gender"] = dataset["Gender"].astype(int)

X = dataset.drop(columns=["User_ID", "Calories"])
y = dataset["Calories"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBRegressor()
model.fit(X_train, y_train)

predictions = model.predict(X_test)
mae = metrics.mean_absolute_error(y_test, predictions)
print(f"Mean Absolute Error on test set: {mae:.4f}")

model_path = os.path.join(BASE_DIR, "model.joblib")
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
