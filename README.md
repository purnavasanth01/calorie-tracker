# CalTrack

Full-stack version of my earlier calorie-burn prediction project ([CALORIE-BURNT-PREDICTION](https://github.com/purnavasanth01/CALORIE-BURNT-PREDICTION)). That one was just a notebook — this wraps the same trained XGBoost model in an actual web app: log a workout, get a calorie estimate back, track it over time.

Angular on the frontend, Node/Express + TypeScript on the backend, MongoDB for storage, Google login, and a Stripe-based premium tier (unlimited history + CSV export vs free = last 5 sessions).

## Stack

- Angular + TypeScript (frontend)
- Node/Express + TypeScript (backend)
- MongoDB Atlas
- Passport.js for Google OAuth
- Stripe Checkout (test mode)
- Python/XGBoost for the actual prediction, called from Node as a subprocess

## Running it locally

You'll need Node 20+, Python 3.10+, and a free MongoDB Atlas account.

Clone it and install both sides:

```powershell
git clone <this-repo-url>
cd calorie-tracker
cd backend && npm install
cd ../frontend && npm install
cd ..
```

**Mongo** — spin up a free M0 cluster on Atlas, add a DB user, allow access from anywhere (fine for local dev), grab the connection string from Connect → Drivers → Node.js.

**Google OAuth** — Google Cloud Console → new project → Google Auth Platform → configure as External → Clients → Create Client → Web application. Redirect URI has to be exactly:
```
http://localhost:5000/api/auth/google/callback
```
Grab the client ID and secret it gives you.

**Stripe** — sign up at stripe.com, stay in test mode, Developers → API keys → copy the secret key (`sk_test_...`). Test card for checkout is `4242 4242 4242 4242`, any future date, any CVC.

Once you have those three, copy the env template and fill it in:

```powershell
cd backend
copy .env.example .env
```

```
MONGODB_URI=<atlas connection string>
SESSION_SECRET=<anything random>
GOOGLE_CLIENT_ID=<from google console>
GOOGLE_CLIENT_SECRET=<from google console>
STRIPE_SECRET_KEY=<from stripe>
```

Train the model once (this is what actually powers the predictions):

```powershell
cd backend/ml
python -m venv venv
./venv/Scripts/pip install -r requirements.txt
./venv/Scripts/python train_model.py
cd ../..
```

Then run backend and frontend in two terminals:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm start
```

Backend's on :5000, frontend on :4200. Open :4200 and log in with Google.

## Notes

- Didn't bother wiring up the Stripe webhook for local dev — it's not reachable without a public URL anyway. Instead the premium unlock just verifies the checkout session directly when Stripe redirects back, works fine for testing.
- `.env` is gitignored, only `.env.example` is committed. Don't put real keys in the example file.
- These commands are PowerShell/Windows. On Mac or Linux swap the venv activation for `source venv/bin/activate`.

## Project layout

```
backend/
  src/       express + ts source (routes, controllers, models, config)
  ml/        train_model.py, predict.py, the datasets, the trained model
frontend/
  src/app/
    core/    services, models, guards, interceptor
    pages/   login, dashboard, predict, history, premium, profile
    shared/  navbar
```
