import os
from dotenv import load_dotenv, find_dotenv

from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import ItemType


load_dotenv()

WORKFLOW = {
    "name": "azd-support",
    "version": "15",
}


def run_workflow(message: str) -> tuple[str, str]:
    endpoint = os.environ["PROJECT_ENDPOINT"]

    with (
        DefaultAzureCredential() as credential,
        AIProjectClient(endpoint=endpoint, credential=credential) as project_client,
        project_client.get_openai_client() as openai_client,
    ):
        conversation = openai_client.conversations.create()

        stream = openai_client.responses.create(
            conversation=conversation.id,
            extra_body={"agent": {"name": WORKFLOW["name"], "type": "agent_reference"}},
            input=message,
            stream=True,
            metadata={"x-ms-debug-mode-enabled": "1"},
        )

        response_text = ""
        for event in stream:
            if event.type == "response.output_text.delta":
                response_text += getattr(event, "delta", "")
            if (
                event.type == "response.output_item.done"
                and event.item.type == ItemType.WORKFLOW_ACTION
            ):
                pass  # workflow action tracking, extend here if needed

        conversation_id = conversation.id
        openai_client.conversations.delete(conversation_id=conversation_id)

        return conversation_id, _strip_json_prefix(response_text)


def _strip_json_prefix(text: str) -> str:
    text = text.strip()
    if not text.startswith("{"):
        return text
    depth = 0
    in_string = False
    escape = False
    for i, ch in enumerate(text):
        if escape:
            escape = False
            continue
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[i + 1:].strip()
    return text
