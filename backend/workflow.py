import os
from dotenv import load_dotenv, find_dotenv

from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import ItemType
from openai.types.responses.response_input_param import McpApprovalResponse


load_dotenv()

WORKFLOW = {
    "name": "azd-support",
    "version": "15",
}

MAX_APPROVAL_ROUNDS = 5


def run_workflow(message: str) -> tuple[str, str]:
    endpoint = os.environ["PROJECT_ENDPOINT"]

    with (
        DefaultAzureCredential() as credential,
        AIProjectClient(endpoint=endpoint, credential=credential) as project_client,
        project_client.get_openai_client() as openai_client,
    ):
        conversation = openai_client.conversations.create()

        next_input = message
        response_text = ""

        for _ in range(MAX_APPROVAL_ROUNDS):
            stream = openai_client.responses.create(
                conversation=conversation.id,
                extra_body={"agent": {"name": WORKFLOW["name"], "type": "agent_reference"}},
                input=next_input,
                stream=True,
                metadata={"x-ms-debug-mode-enabled": "1"},
            )

            response_text = ""
            pending_approval_ids = []
            for event in stream:
                if event.type != "response.output_item.done":
                    continue

                if event.item.type == ItemType.MESSAGE:
                    # Each workflow step (classification, drafting, resolution)
                    # emits its own complete message; only the last one is the
                    # answer meant for the user.
                    response_text = "".join(
                        part.text for part in event.item.content if hasattr(part, "text")
                    )
                elif event.item.type == ItemType.MCP_APPROVAL_REQUEST:
                    pending_approval_ids.append(event.item.id)
                elif event.item.type == ItemType.WORKFLOW_ACTION:
                    pass  # workflow action tracking, extend here if needed

            if not pending_approval_ids:
                break

            # The agent's MCP tool (knowledge base retrieval) requires explicit
            # approval before it can run; auto-approve so the workflow can
            # continue on to generate the actual answer.
            next_input = [
                McpApprovalResponse(
                    type="mcp_approval_response",
                    approve=True,
                    approval_request_id=approval_id,
                )
                for approval_id in pending_approval_ids
            ]

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
                remainder = text[i + 1:].strip()
                return remainder if remainder else text
    return text
