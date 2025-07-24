from langchain_community.tools import WikipediaQueryRun, DuckDuckGoSearchRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain.tools import Tool
from datetime import datetime

def save_to_txt(data: str, filename: str = "research_output.txt"):
    os.makedirs("docs", exist_ok=True)
    full_path = os.path.join("docs", filename)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_text = f"--- Research Output ---\nTimestamp: {timestamp}\n\n{data}\n\n"

    with open(full_path, "a", encoding="utf-8") as f:
        # erase the file if it exists
        f.truncate(0)
        
        # write the formatted text
        f.write(formatted_text)
    
    return f"Data successfully saved to {full_path}"

save_tool = Tool(
    name="save_text_to_file",
    func=save_to_txt,
    description="Saves structured research data to a text file.",
)


# Getting files from a repo:
import os
import subprocess
import shutil

def get_repo_files(repo_url: str, clone_dir: str = "repo"):
    # Clears the clone directory:
    if os.path.exists(clone_dir):
        shutil.rmtree(clone_dir)

    # Clones repository
    subprocess.run(["git", "clone", repo_url, clone_dir], check=True)

    # Loops files and returns list:
    files_list = []
    for root, _, files in os.walk(clone_dir):
        for file in files:
            file_path = os.path.join(root, file)
            # Skips hidden files:
            if file_path.startswith("repo/."):
                continue
            files_list.append(file_path)
            # print(file_path)
            # Reads files content
            # try:
            #     with open(file_path, 'r', encoding='utf-8') as f:
            #         print(f"\n--- {file_path} ---\n")
            #         print(f.read())
            # except Exception as e:
            #     print(f"\n--- Skipped {file_path} (error: {e}) ---\n")
    
    # print(files_list)
    return files_list




# ++++++++++++++++++++++++++++++++++++++++ Mi ++++++++++++++++++++++++++++++++++++++++

import secrets
import string

def generate_random_string(length=12):
    characters = string.ascii_letters + string.digits  # A-Z, a-z, 0-9
    return ''.join(secrets.choice(characters) for _ in range(length))

# # Example usage
# random_str = generate_random_string()
# print(random_str)




# ++++++++++++++++++++++++++++++++++++++++ Repo Files Processing ++++++++++++++++++++++++++++++++++++++++

import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

chroma_client = chromadb.HttpClient(host='10.112.154.220', port=8001)
default_ef = DefaultEmbeddingFunction()
collection = chroma_client.get_or_create_collection(name="my_collection", embedding_function =default_ef)

# switch add to upsert to avoid adding the same documents every time 

# Saves info into db:
def save_docs_in_db(docs: list = [], unique_id: str = ""):
    print("save_docs_in_db -> saving docs in db:")
    print(len(docs))

    unique_id = generate_random_string()
    print("unique_id:")
    print(unique_id)

    collection.upsert(
        documents=docs,
        ids=[unique_id]
    )




