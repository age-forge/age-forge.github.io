# Getting Started

This guide walks you through installing age-orm, setting up PostgreSQL with AGE, and running your first graph queries.

## Prerequisites

- **Python 3.12+**
- **PostgreSQL 16** (or 15/17 with matching AGE version)
- **Apache AGE extension** installed on your PostgreSQL

### Installing Apache AGE

If you don't have AGE installed, you can build it from source:

```bash
# Install build dependencies
sudo apt-get install postgresql-server-dev-16 build-essential

# Clone and build AGE
git clone --branch release/PG16/1.5.0 --depth 1 https://github.com/apache/age.git
cd age
make -j$(nproc)
sudo make install
```

Then enable the extension in your database:

```sql
CREATE EXTENSION IF NOT EXISTS age;
```

Alternatively, use the official Docker image:

```bash
docker run -d \
  -p 5433:5432 \
  -e POSTGRES_USER=ageuser \
  -e POSTGRES_PASSWORD=agepassword \
  -e POSTGRES_DB=agedb \
  apache/age:release_PG16_1.5.0
```

## Installation

```bash
pip install age-orm
```

Or with uv:

```bash
uv add age-orm
```

## First Connection

Connect to your AGE database and create a graph:

```python
from age_orm import Database

db = Database("postgresql://user:password@localhost/mydb")

# Create a new graph (or get an existing one)
graph = db.graph("my_graph", create=True)

# Check it exists
print(db.graph_exists("my_graph"))  # True
print(db.list_graphs())             # ['my_graph']
```

The `Database` class manages a connection pool. Each connection is automatically configured with `LOAD 'age'` and the correct search path.

## Define Models

Vertices and edges are defined as Pydantic models:

```python
from age_orm import Vertex, Edge

class Person(Vertex):
    __label__ = "Person"  # AGE label (defaults to class name)
    name: str
    age: int
    email: str | None = None

class Knows(Edge):
    __label__ = "KNOWS"
    since: int
    relationship_type: str = "friend"
```

Models inherit from Pydantic's `BaseModel`, so you get validation, serialization, and type hints for free.

## Create, Query, Delete

```python
# Create a vertex
alice = Person(name="Alice", age=30, email="alice@example.com")
graph.add(alice)
print(alice.graph_id)  # AGE assigns an ID automatically

# Query vertices
people = graph.query(Person).filter_by(name="Alice").all()
alice = graph.query(Person).filter_by(name="Alice").one()

# Create an edge
bob = Person(name="Bob", age=25)
graph.add(bob)
graph.connect(alice, Knows(since=2024), bob)

# Update
alice.age = 31
graph.update(alice)

# Delete
graph.delete(bob)  # DETACH DELETE removes vertex and connected edges
```

## Cleanup

```python
# Drop the graph when done
db.drop_graph("my_graph")

# Close the connection pool
db.close()
```

Or use the context manager:

```python
with Database("postgresql://user:password@localhost/mydb") as db:
    graph = db.graph("my_graph", create=True)
    # ... use graph ...
# Pool is closed automatically
```

## Next Steps

- [Tutorial](/docs/tutorial) -- Full walkthrough building a social graph
- [Query Builder](/docs/query-builder) -- Filtering, sorting, pagination, and bulk operations
- [Relationships](/docs/relationships) -- Lazy-loaded graph traversal
