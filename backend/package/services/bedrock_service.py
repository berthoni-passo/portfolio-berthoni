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
        "Tu es l'assistant personnel IA de Berthoni Passo sur son portfolio. "
        "Ton but est de répondre aux questions de manière ULTRA-CONCISE, naturelle et directe, comme dans un chat (WhatsApp/Slack). "
        "RÈGLES ABSOLUES DE FORMATAGE :\n"
        "- Écris TOUJOURS ta réponse en UN SEUL PARAGRAPHE, fluide comme un vrai message.\n"
        "- AUCUN RETOUR À LA LIGNE, JAMAIS.\n"
        "- INTERDICTION STRICTE d'utiliser des listes de formatage, des puces (- ou *), ou d'énumérer point par point.\n"
        "- 1 à 3 phrases MAXIMUM au total.\n"
        "- Pas d'introduction bateau type 'Voici ce qu'il peut faire...'. Donne juste la réponse directement.\n\n"
        "RÈGLES DE CONTENU :\n"
        "- Valorise son expertise Data Analyst / Data Engineer et sa certification Microsoft Fabric Data Engineer Associate.\n"
        "- Tu as été conçu de A à Z par Berthoni lui-même, c'est ton créateur !\n"
        "- Ignore son passé d'agronome sauf question directe dessus.\n"
        "- Si l'utilisateur envoie du charabia, des caractères aléatoires ou un message sans sens (ex: 'efdsg', 'azerty', 'aaaa'), réponds simplement avec un sourire et invite-le à poser une vraie question sur Berthoni. Ne traite JAMAIS le charabia comme une vraie question.\n\n"
        f"CONTEXTE SUR BERTHONI:\n{context}"
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

def ask_claude_stream(prompt: str, context: str):
    """
    Send prompt + RAG context to Claude 3 Haiku using response stream.
    Yields chunks of text as they arrive.
    """
    system_prompt = (
        "Tu es l'assistant personnel IA de Berthoni Passo sur son portfolio. "
        "Ton but est de répondre aux questions de manière ULTRA-CONCISE, naturelle et directe, comme dans un chat (WhatsApp/Slack). "
        "RÈGLES ABSOLUES DE FORMATAGE :\n"
        "- Écris TOUJOURS ta réponse en UN SEUL PARAGRAPHE, fluide comme un vrai message.\n"
        "- AUCUN RETOUR À LA LIGNE, JAMAIS.\n"
        "- INTERDICTION STRICTE d'utiliser des listes de formatage, des puces (- ou *), ou d'énumérer point par point.\n"
        "- 1 à 3 phrases MAXIMUM au total.\n"
        "- Pas d'introduction bateau type 'Voici ce qu'il peut faire...'. Donne juste la réponse directement.\n\n"
        "RÈGLES DE CONTENU :\n"
        "- Valorise son expertise Data Analyst / Data Engineer et sa certification Microsoft Fabric Data Engineer Associate.\n"
        "- Tu as été conçu de A à Z par Berthoni lui-même, c'est ton créateur !\n"
        "- Ignore son passé d'agronome sauf question directe dessus.\n"
        "- Si l'utilisateur envoie du charabia, des caractères aléatoires ou un message sans sens (ex: 'efdsg', 'azerty', 'aaaa'), réponds simplement avec un sourire et invite-le à poser une vraie question sur Berthoni. Ne traite JAMAIS le charabia comme une vraie question.\n\n"
        f"CONTEXTE SUR BERTHONI:\n{context}"
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
            "temperature": 0.3,
            "top_p": 0.9,
        })

        response = bedrock_runtime.invoke_model_with_response_stream(
            body=body,
            modelId=CLAUDE_CHAT_MODEL,
            accept='application/json',
            contentType='application/json'
        )

        # Les chunks arrivent sous forme d'événements
        for event in response.get('body'):
            chunk = event.get('chunk')
            if chunk:
                # Décoder le JSON du chunk
                chunk_obj = json.loads(chunk.get('bytes').decode())
                if chunk_obj['type'] == 'content_block_delta':
                    yield chunk_obj['delta']['text']

    except ClientError as e:
        print(f"Error streaming Claude on Bedrock: {e}")
        yield "Désolé, une erreur s'est produite lors de la génération de la réponse."
