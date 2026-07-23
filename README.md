# AZD Support

A chatbot built on Azure AI Foundry that helps users with the `azd` (Azure Developer CLI) tool. Backend built with FastAPI, frontend with React + TypeScript (Vite). The workflow's expert agent uses a knowledge base — a RAG index built on Azure AI Search — as its tool; the index contains documentation about `azd` along with descriptions of known errors and issues.

## Workflow

The chatbot is powered by the `azd-support` workflow defined in Azure AI Foundry, which orchestrates three agents for each message:

1. **Collect-Info-Agent** — classifies the user's question and assigns a confidence score.
2. **azd-expert-agent** — for confident classifications, retrieves relevant docs from a knowledge base (via an MCP tool) and drafts an answer.
3. **Resolution-Agent** — produces the final response returned to the user.

![azd-support workflow](./azd-support%20workflow.png)

## How the workflow works in the backend

`backend/workflow.py` drives the Foundry workflow through the streaming Responses API:

1. Creates a new conversation (`openai_client.conversations.create()`) and sends the user's message to the `azd-support` agent with `stream=True`.
2. Listens for `response.output_item.done` events — each one marks a completed step's output (an agent's message, a tool call, an approval request, etc.).
3. When the completed item is an `mcp_approval_request`, the backend **automatically approves it** (`approve=True`). This is needed because `azd-expert-agent`'s knowledge base tool is configured to require approval before every call — a safety gate built into Azure AI Foundry so tool calls aren't executed silently. Since the knowledge base is our own trusted resource and there's no human reviewer in a chat API, auto-approving lets the workflow continue without manual intervention.
4. After approving, it resubmits the approval into the same conversation and keeps streaming, for up to 5 rounds, in case more than one approval is needed.
5. For every completed `message` item, the backend overwrites its running result with that message's full text. Each agent in the workflow (`Collect-Info-Agent`, `azd-expert-agent`, `Resolution-Agent`) emits its own complete message, so only the last one — the `Resolution-Agent`'s answer — ends up being kept.
6. Finally, it strips a possible leading JSON debug prefix from the text and deletes the conversation before returning `(conversation_id, response)` to the FastAPI endpoint.

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

