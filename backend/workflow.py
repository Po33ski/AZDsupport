import os
from dotenv import load_dotenv

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
            if event.type == "response.completed":
                for output_item in event.response.output:
                    if output_item.content:
                        for content_item in output_item.content:
                            if content_item.type == "output_text":
                                response_text += content_item.text
            if (
                event.type == "response.output_item.done"
                and event.item.type == ItemType.WORKFLOW_ACTION
            ):
                pass  # workflow action tracking, extend here if needed

        conversation_id = conversation.id
        openai_client.conversations.delete(conversation_id=conversation_id)

        return conversation_id, response_text
