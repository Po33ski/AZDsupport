# AZD Support

A chatbot built on Azure AI Foundry that helps users with the `azd` (Azure Developer CLI) tool. Backend built with FastAPI, frontend with React + TypeScript (Vite).

## Requirements

- Python 3.10+
- Node.js 18+
- Azure account with access to Azure AI Foundry
- Azure CLI logged in (`az login`)

## Environment setup

Edit the `.env` file in the project root directory:

```env
PROJECT_ENDPOINT="https://<your-resource>.services.ai.azure.com/api/projects/<project-name>"
MODEL_DEPLOYMENT_NAME="gpt-4.1"
```

- `PROJECT_ENDPOINT` — your Azure AI Foundry project endpoint. Find it in the Azure portal under: **Azure AI Foundry → Your project → Overview → Project endpoint**.
- `MODEL_DEPLOYMENT_NAME` — the name of the deployed model (e.g. `gpt-4.1`). Find it in the **Deployments** section of your project.

## Running the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

Health check: `http://localhost:8000/health`

## Running the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Usage

Open `http://localhost:5173` in your browser and ask a question about Azure Developer CLI.
