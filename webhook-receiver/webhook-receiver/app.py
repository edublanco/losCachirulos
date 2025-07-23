# app.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import cloude_model_client
import json

app = FastAPI()

# https://smee.io/2cfEQA9MpmFkrd9
@app.post("/webhook")
async def handle_webhook(request: Request):
    """
     Listens to webhook trigger to start creating documentation   
    """
    payload = await request.json()
    #print("Received webhook:", json.dumps(payload, indent=4))
    #print(payload["pull_request"])
    #Build URL for cloning repo
    repo_full_name=payload["repository"]["full_name"]
    commit_sha = payload["pull_request"]["head"]["sha"]
    github_url=f"https://api.github.com/repos/{repo_full_name}/git/trees/{commit_sha}?recursive=1"
    cloude_model_client.get_doc_from_cloude(github_url)
    return JSONResponse(content={"status": "ok"})
