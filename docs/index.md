# age-orm

A Python ORM for [Apache AGE](https://age.apache.org/) that makes graph database operations intuitive and Pythonic.

## Key Features

- **Pydantic Models** -- Define vertices and edges as type-safe Python classes
- **Query Builder** -- Fluent API for building Cypher queries with filter, sort, limit, and pagination
- **Relationship Navigation** -- Lazy-loaded graph traversal through Python attributes
- **Async Support** -- First-class async/await support with psycopg3
- **Event System** -- Pre/post hooks for add, update, and delete operations
- **Bulk Operations** -- High-performance batch insert using direct SQL for large datasets
- **PostgreSQL Native** -- Works with AGE's agtype system and standard PostgreSQL tooling

## Quick Example

```python
from age_orm import Database, Vertex, Edge

# Define models
class Person(Vertex):
    __label__ = "Person"
    name: str
    age: int

class Knows(Edge):
    __label__ = "KNOWS"
    since: int

# Connect to database
with Database("postgresql://user:pass@localhost/mydb") as db:
    graph = db.graph("social", create=True)

    # Create vertices
    alice = Person(name="Alice", age=30)
    bob = Person(name="Bob", age=25)
    graph.add(alice)
    graph.add(bob)

    # Create edge
    graph.connect(alice, Knows(since=2020), bob)

    # Query
    people = graph.query(Person).filter("n.age > $min", min=20).sort("n.name").all()
    for person in people:
        print(f"{person.name}, age {person.age}")
```

## Installation

```bash
pip install age-orm
```

Or with [uv](https://docs.astral.sh/uv/):

```bash
uv add age-orm
```

## Requirements

- Python 3.12+
- PostgreSQL with [Apache AGE](https://age.apache.org/) extension
- psycopg3

## Next Steps

- [Getting Started](/docs/getting-started) -- Set up your environment and first graph
- [Tutorial](/docs/tutorial) -- Build a social graph application step by step
- [Query Builder](/docs/query-builder) -- Full reference for the query API
