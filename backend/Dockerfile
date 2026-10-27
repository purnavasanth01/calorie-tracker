# Backend image: Node API + Python ML model in one container.

# 1. Start from a small Linux (Debian) image with Node 22 already installed
FROM node:22-slim

# 2. Install Python, and libgomp1 (the Linux version of the libomp library XGBoost needs)
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 3. Python packages, in their own virtualenv
COPY ml/requirements.txt ml/requirements.txt
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r ml/requirements.txt

# 4. Node packages (copied first so Docker can reuse this step when only code changes)
COPY package.json package-lock.json ./
RUN npm ci

# 5. Copy the code and model, then compile TypeScript into dist/
COPY . .
RUN npm run build && npm prune --omit=dev

# 6. Fail the build early if the model can't load or gives a wrong answer
RUN echo '{"gender":"male","age":25,"height":170,"weight":70,"duration":15,"heartRate":95,"bodyTemp":40}' \
    | /opt/venv/bin/python ml/predict.py \
    | grep -q '"calories": 57.' \
    || (echo "Model sanity check failed" && exit 1)

# 7. Settings the app reads from process.env (Render adds the secrets and PORT)
ENV NODE_ENV=production \
    PYTHON_PATH=/opt/venv/bin/python \
    ML_DIR=/app/ml

# 8. Start the server
CMD ["node", "dist/server.js"]
