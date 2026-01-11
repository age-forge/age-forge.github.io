# AgeORM

A Python ORM for Apache AGE, making graph database operations intuitive and Pythonic.

## Vision

AgeORM aims to provide the same developer experience that [arango-orm](https://github.com/kashifpk/arango-orm) provides for ArangoDB—but for Apache AGE.

## Planned Features

- **Model Definitions** - Define vertices and edges as Python classes with type hints
- **Schema Management** - Automatic graph schema creation and migrations
- **Query Builder** - Pythonic API for building Cypher queries
- **Relationship Navigation** - Traverse edges naturally using Python attributes
- **Async Support** - First-class async/await support with asyncpg
- **PostgreSQL Integration** - Seamlessly combine graph and relational queries

## Example (Planned API)

```python
from age_orm import Graph, Vertex, Edge, Field

class Person(Vertex):
    name: str = Field(index=True)
    age: int

class Knows(Edge):
    since: int
    relationship: str

# Connect to AGE
graph = Graph("postgresql://user:pass@localhost/db", graph_name="social")

# Create vertices
alice = Person(name="Alice", age=30)
bob = Person(name="Bob", age=25)
await graph.save(alice)
await graph.save(bob)

# Create edge
friendship = Knows(since=2020, relationship="colleague")
await graph.connect(alice, friendship, bob)

# Query
friends = await alice.outgoing(Knows).all()
```

## Status

**Current Phase:** Design & Research

We're currently:
- Studying Apache AGE's Cypher implementation
- Designing the model definition API
- Evaluating connection pooling strategies

## Get Involved

Interested in helping build AgeORM?

- Watch the [age-forge](https://github.com/age-forge) organization for updates
- Share your use cases and API preferences in GitHub Discussions

## Related

- [Apache AGE Documentation](https://age.apache.org/docs/)
- [arango-orm](https://github.com/kashifpk/arango-orm) - The inspiration for this project
