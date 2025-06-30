from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import traceback

app = FastAPI()

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: TextRequest):
    try:
        embedding = model.encode(req.text, normalize_embeddings=True).tolist()
        return {"embedding": embedding}
    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}\n{tb}")
