# AgeORM

A Python ORM for Apache AGE, making graph database operations intuitive and Pythonic.

::: tip v0.1.0 Released
age-orm v0.1.0 is available with full CRUD, query builder, events, relationships, and bulk operations. **[Read the documentation &rarr;](/docs/)**
:::

## Features

- **Pydantic v2 Models** -- Define vertices and edges as type-safe Python classes with validation
- **Query Builder** -- Fluent API for Cypher queries: `filter()`, `sort()`, `limit()`, `all()`, `one()`, `count()`
- **Relationship Navigation** -- Lazy-loaded graph traversal via Python attributes
- **Async Support** -- Full async/await support with psycopg3 and connection pooling
- **Event System** -- Pre/post hooks for add, update, and delete operations
- **Bulk Operations** -- High-performance batch insert bypassing Cypher for large datasets

## Quick Example

```python
from age_orm import Database, Vertex, Edge

class Person(Vertex):
    __label__ = "Person"
    name: str
    age: int

class Knows(Edge):
    __label__ = "KNOWS"
    since: int

with Database("postgresql://user:pass@localhost/mydb") as db:
    graph = db.graph("social", create=True)

    alice = Person(name="Alice", age=30)
    bob = Person(name="Bob", age=25)
    graph.add(alice)
    graph.add(bob)

    graph.connect(alice, Knows(since=2024), bob)

    friends = graph.query(Person).filter("n.age > $min", min=20).sort("n.name").all()
```

## Tech Stack

- Python 3.12+
- Pydantic v2
- psycopg3 (sync + async)
- Apache AGE on PostgreSQL

## Status

**Current Phase:** v0.1.0 -- Core Implementation Complete

- [x] Model definitions (Vertex, Edge)
- [x] Database connection management with pooling
- [x] Graph CRUD operations (add, update, delete, connect)
- [x] Query builder with filter, sort, limit, pagination
- [x] Bulk insert operations (vertices and edges)
- [x] Graph traversal (traverse, expand)
- [x] Relationship navigation with lazy loading
- [x] Event system (pre/post hooks)
- [x] Async support (AsyncDatabase, AsyncGraph, AsyncQuery)
- [x] 87 unit tests + 35 integration tests
- [ ] Schema migrations
- [ ] Aggregation queries

## Documentation

Full documentation is available in the **[Docs](/docs/)** section:

- [Getting Started](/docs/getting-started)
- [Tutorial](/docs/tutorial)
- [Query Builder Reference](/docs/query-builder)
- [Relationships](/docs/relationships)
- [Events](/docs/events)
- [API Reference](/docs/api-reference)

## Get Involved

- Watch the [age-forge](https://github.com/age-forge) organization for updates
- Report issues or contribute on [GitHub](https://github.com/age-forge/age-orm)

## Related

- [Apache AGE Documentation](https://age.apache.org/docs/)
- [arango-orm](https://github.com/kashifpk/arango-orm) -- The inspiration for this project
