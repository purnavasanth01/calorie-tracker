import sys
import os
import json
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")


def main():
    raw = sys.argv[1] if len(sys.argv) == 2 else sys.stdin.read()
    raw = raw.lstrip("﻿")

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": f"Invalid JSON input: {exc}"}))
        sys.exit(1)

    if not os.path.exists(MODEL_PATH):
        print(json.dumps({"error": "Model not found. Run train_model.py first."}))
        sys.exit(1)

    model = joblib.load(MODEL_PATH)

    gender_raw = payload.get("gender")
    gender = 1 if str(gender_raw).lower() in ("female", "1") else 0

    row = pd.DataFrame([{
        "Gender": gender,
        "Age": float(payload["age"]),
        "Height": float(payload["height"]),
        "Weight": float(payload["weight"]),
        "Duration": float(payload["duration"]),
        "Heart_Rate": float(payload["heartRate"]),
        "Body_Temp": float(payload["bodyTemp"]),
    }])

    prediction = model.predict(row)[0]
    print(json.dumps({"calories": round(float(prediction), 2)}))


if __name__ == "__main__":
    main()
