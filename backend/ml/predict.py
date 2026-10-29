import sys
import os
import json
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")


def load_model():
    if not os.path.exists(MODEL_PATH):
        print(json.dumps({"error": "Model not found. Run train_model.py first."}), flush=True)
        sys.exit(1)
    return joblib.load(MODEL_PATH)


def predict(model, payload):
    gender = 1 if str(payload.get("gender")).lower() in ("female", "1") else 0
    row = pd.DataFrame([{
        "Gender": gender,
        "Age": float(payload["age"]),
        "Height": float(payload["height"]),
        "Weight": float(payload["weight"]),
        "Duration": float(payload["duration"]),
        "Heart_Rate": float(payload["heartRate"]),
        "Body_Temp": float(payload["bodyTemp"]),
    }])
    return round(max(0.0, float(model.predict(row)[0])), 2)


def serve(model):
    for line in sys.stdin:
        request = json.loads(line)
        try:
            response = {"id": request["id"], "calories": predict(model, request["input"])}
        except (KeyError, TypeError, ValueError) as exc:
            response = {"id": request.get("id"), "error": f"Invalid input: {exc}"}
        print(json.dumps(response), flush=True)


def main():
    model = load_model()
    if "--serve" in sys.argv:
        serve(model)
        return

    try:
        payload = json.loads(sys.stdin.read().lstrip("﻿"))
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": f"Invalid JSON input: {exc}"}))
        sys.exit(1)
    print(json.dumps({"calories": predict(model, payload)}))


if __name__ == "__main__":
    main()
