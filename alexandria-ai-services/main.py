from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserMessage(BaseModel):
    chatId: str
    message: str

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/send_message")
def send_message(message: UserMessage):
    responseMessage = "Ivan"
    responseChatId = "was here"

    return {
        "responseMessage": message.message,
        "responseChatId": message.chatId
    }