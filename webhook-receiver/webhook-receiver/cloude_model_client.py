import requests

def get_doc_from_cloude(url):
	print(url)
	data = {"repo_url": url}
	response = requests.post(f"http://127.0.0.1:8000/getRepo?repo_url={url}")
	print("Calling Cloude")
	print(response)
	#end


