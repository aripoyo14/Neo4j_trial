from fastapi import FastAPI
from pydantic import BaseModel
from neo4j_client import fetch_top_people

app = FastAPI()

class TagWeight(BaseModel):
    id: int
    weight: float

class QueryIn(BaseModel):
    tagWeights: list[TagWeight]
    threshold: float = 0.7
    limit: int = 20

@app.post("/api/top-people")
def top_people(payload: QueryIn):
    people = fetch_top_people(
        [tw.dict() for tw in payload.tagWeights],
        payload.threshold,
        payload.limit
    )
    return {"results": people}
