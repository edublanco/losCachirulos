from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_tool_calling_agent, AgentExecutor
from tools import save_tool
import chromadb

# client = chromadb.HttpClient(host="localhost", port=8000, ssl=False)
from tools import get_repo_files
from tools import save_docs_in_db
from typing import Union
from fastapi import FastAPI
import os
import json

app = FastAPI()
load_dotenv()




# ++++++++++++++++++++++++++++++++++++++++ LangChain Agents ++++++++++++++++++++++++++++++++++++++++

class ResearchResponse(BaseModel):
    topic: str
    summary: str
    bulleted_list: list[str]
    additional_info: str
    #sources: list[str]
    #tools_used: list[str]

llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
parser = PydanticOutputParser(pydantic_object=ResearchResponse)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            You are an ex software engineer, focused on documentation
            Make documentation of the given code 
            Wrap the output in this format and provide no other text\n{format_instructions}
            """,
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{query}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
).partial(format_instructions=parser.get_format_instructions())

tools = []
agent = create_tool_calling_agent(
    llm=llm,
    prompt=prompt,
    tools=tools,
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)




# ++++++++++++++++++++++++++++++++++++++++ Fast API ++++++++++++++++++++++++++++++++++++++++

@app.post("/documentation")
def create_documentation(query: str):
    raw_response = agent_executor.invoke({"query": query})
    structured_response = parser.parse(raw_response.get("output")[0]["text"])
    return structured_response


# Repo Files Processing
@app.post("/getRepo")
def get_files_list(repo_url: str):
    files = get_repo_files(repo_url)
    print(files)
    # Loops files, reads them and sends to agents:
    # docs = []
    for file in files:
        try:
            # file_path = os.path.join(root, file)
            file_path = file
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
                # print("file_content:")
                # print(file_content)
                raw_response = agent_executor.invoke({"query": file_content})
                structured_response = parser.parse(raw_response.get("output")[0]["text"])

                print(" ++++++++++++++++++++++++++++++++++++++++ structured_response ++++++++++++++++++++++++++++++++++++++++ ")
                # print(type(structured_response))
                # print(structured_response)

                response_json = json.dumps(structured_response.__dict__, indent=2)

                save_docs_in_db(docs=[response_json])

                # docs.append(response_json)

                # print("response_json:")
                # print(type(response_json))
                # print(response_json)

                # print("response_json['summary']:")
                # print(response_json[1])

                # bulletpoints = " ".join(response_json[2])
                # print("bulletpoints:")
                # print(bulletpoints)

                # result = f"{response_json['summary']}, {bulletpoints}"
                # print(result)

                # print("result:")
                # print(result)
               
                print(" ---------------------------------------- structured_response ---------------------------------------- ")
                
                #docs.append(raw_response)
                # print(structured_response)
                # print(f"\n--- {file_path} ---\n")
                # print(f.read())
        except Exception as e:
            print(f"\n--- Skipped {file_path} (error: {e}) ---\n")

    # print(" ++++++++++++++++++++++++++++++++++++++++ docs ++++++++++++++++++++++++++++++++++++++++ ")
    # print(docs)
    # print(" ---------------------------------------- docs ---------------------------------------- ")

    # Saves all docs in db at once:
    # save_docs_in_db(docs=docs)

    return {"files": files}




# ++++++++++++++++++++++++++++++++++++++++ Repo Files Processing ++++++++++++++++++++++++++++++++++++++++





