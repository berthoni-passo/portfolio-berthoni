import boto3
import json
import os
from typing import List
from botocore.exceptions import ClientError

# Initialize AWS Bedrock clients
# Ensure AWS credentials are set in environment variables or standard ~/.aws/credentials
# Note: Bedrock service might be strictly available in certain regions (e.g. us-east-1, us-west-2, eu-central-1, eu-west-3)
region = os.getenv("AWS_REGION", "eu-west-3") # Paris region or customize as needed
bedrock_runtime = boto3.client(service_name='bedrock-runtime', region_name=region)

TITAN_EMBEDDING_MODEL = "amazon.titan-embed-text-v2:0"
CLAUDE_CHAT_MODEL = "anthropic.claude-3-haiku-20240307-v1:0"

def get_embedding(text: str) -> List[float]:
    """
    Generate vector embeddings using Amazon Titan Text Embeddings V2.
    Cost: Very low (~$0.02 per 1M tokens)
    """
    try:
        body = json.dumps({
            "inputText": text,
            "dimensions": 512, # 512 is standard for Titan v2, can be 256 or 1024
            "normalize": True
        })
        
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=TITAN_EMBEDDING_MODEL,
            accept='application/json',
            contentType='application/json'
        )
        
        response_body = json.loads(response.get('body').read())
        return response_body.get('embedding')
        
    except ClientError as e:
        print(f"Error calling Bedrock Embeddings: {e}")
        raise

def ask_claude(prompt: str, context: str) -> str:
    """
    Send prompt + RAG context to Claude 3 Haiku for blazing fast, cheap generation.
    """
    system_prompt = (
        "Tu es l'assistant personnel de Berthoni Passo, intégré directement sur son portfolio. "
        "Ton rôle est de répondre aux questions des visiteurs (recruteurs, collaborateurs) de manière concise, chaleureuse et professionnelle. "
        "IMPORTANT : Ne mentionne JAMAIS que tu te bases sur un 'contexte' ou des 'informations fournies'. Réponds le plus naturellement possible "
        "comme si tu connaissais intimement Berthoni. Ne fais pas de longues phrases d'introduction du type 'Voici un résumé des compétences...' "
        "Si on te demande ce qu'il sait faire, cite directement ses compétences.\n\n"
        f"INFORMATIONS SUR BERTHONI:\n{context}"
    )
    
    try:
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": [{"type": "text", "text": prompt}]
                }
            ],
            "temperature": 0.3, # Low temperature for factual RAG responses
            "top_p": 0.9,
        })

        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=CLAUDE_CHAT_MODEL,
            accept='application/json',
            contentType='application/json'
        )

        response_body = json.loads(response.get('body').read())
        return response_body['content'][0]['text']

    except ClientError as e:
        print(f"Error calling Claude on Bedrock: {e}")
        raise
