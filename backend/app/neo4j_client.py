from neo4j import GraphDatabase
import os

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
pwd = os.getenv("NEO4J_PASSWORD")
driver = GraphDatabase.driver(uri, auth=(user, pwd))

def fetch_top_people(tag_weights: list[dict], threshold: float, limit: int):
    query = """
    WITH $tagWeights AS tagWeights, $threshold AS threshold, $limit AS limitCount
    UNWIND tagWeights AS tw
    MATCH (t:Tag {id: tw.id})
    CALL db.index.vector.query('PersonEmbeddingIndex', t.embedding, { topK:10000, includeScore:true })
      YIELD node AS person, score
    WHERE score >= threshold
    WITH person, tw.weight AS w, score AS s
    WITH person, collect({w:w, s:s}) AS wsList
    WITH person, reduce(acc=0.0, x IN wsList | acc + x.w * x.s) AS weightedScore
    RETURN person.id AS id, person.name AS name, weightedScore AS score
    ORDER BY weightedScore DESC
    LIMIT limitCount;
    """
    with driver.session() as session:
        result = session.run(
            query,
            tagWeights=tag_weights,
            threshold=threshold,
            limit=limit
        )
        return [record.data() for record in result]
