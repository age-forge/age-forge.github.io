# Tutorial

This tutorial walks through building a social graph application with age-orm. Every code snippet here has been tested against a real Apache AGE database.

## Setup

```python
from age_orm import Database, Vertex, Edge, listen, listens_for
```

## Define Models

First, define your vertex and edge types:

```python
class Person(Vertex):
    __label__ = "Person"
    name: str
    age: int
    email: str | None = None

class Company(Vertex):
    __label__ = "Company"
    name: str
    industry: str

class Knows(Edge):
    __label__ = "KNOWS"
    since: int
    relationship_type: str = "friend"

class WorksAt(Edge):
    __label__ = "WORKS_AT"
    role: str
    start_year: int
```

The `__label__` class variable sets the AGE label. If omitted, the class name is used.

## Connect to the Database

```python
db = Database("postgresql://user:password@localhost/mydb")
graph = db.graph("social", create=True)
```

The `create=True` flag creates the graph if it doesn't exist. Without it, `GraphNotFoundError` is raised for missing graphs.

You can also check graph existence:

```python
db.graph_exists("social")  # True
db.list_graphs()           # ['social']
```

## Create Vertices

Use `graph.add()` to create vertices:

```python
alice = Person(name="Alice", age=30, email="alice@example.com")
graph.add(alice)

# graph_id is assigned automatically
print(alice.graph_id)  # e.g., 844424930131969
print(alice.is_dirty)  # False -- saved to database
```

Add more people:

```python
bob = Person(name="Bob", age=25)
charlie = Person(name="Charlie", age=35, email="charlie@example.com")
diana = Person(name="Diana", age=28)

for person in [bob, charlie, diana]:
    graph.add(person)
```

## Create Edges

Use `graph.connect()` to create edges between vertices:

```python
# Alice knows Bob (colleague since 2020)
graph.connect(alice, Knows(since=2020, relationship_type="colleague"), bob)

# Alice knows Charlie (friend since 2019)
graph.connect(alice, Knows(since=2019, relationship_type="friend"), charlie)

# Bob knows Diana
graph.connect(bob, Knows(since=2021, relationship_type="friend"), diana)
```

Add a company and employment edge:

```python
acme = Company(name="Acme Corp", industry="Technology")
graph.add(acme)

graph.connect(alice, WorksAt(role="Engineer", start_year=2018), acme)
```

## Query with the Query Builder

### Basic Queries

```python
# Get all people
everyone = graph.query(Person).all()

# Count
count = graph.query(Person).count()  # 4

# Get one by name
alice = graph.query(Person).filter_by(name="Alice").one()
```

### Filtering

`filter_by()` for equality conditions:

```python
alice = graph.query(Person).filter_by(name="Alice").one()
```

`filter()` for arbitrary Cypher conditions with `$param` placeholders:

```python
older_people = (
    graph.query(Person)
    .filter("n.age > $min_age", min_age=28)
    .all()
)
# Returns Alice (30), Charlie (35)
```

### Sorting and Pagination

```python
# Sort by age ascending, get first 2
youngest = (
    graph.query(Person)
    .sort("n.age")
    .limit(2)
    .all()
)
# [Bob (25), Diana (28)]

# Sort descending
oldest = (
    graph.query(Person)
    .sort("n.age DESC")
    .limit(1)
    .all()
)
# [Charlie (35)]

# Skip + Limit for pagination
page_2 = (
    graph.query(Person)
    .sort("n.age")
    .limit(2, skip=2)
    .all()
)
```

### Convenience Lookups

```python
# By property value
alice = graph.query(Person).by_property("name", "Alice")

# first() returns None instead of raising
nobody = graph.query(Person).filter_by(name="NoSuchPerson").first()
# None
```

## Update Entities

Modify fields and call `graph.update()`:

```python
alice = graph.query(Person).filter_by(name="Alice").one()
alice.age = 31
alice.email = "alice@newdomain.com"

graph.update(alice)  # Sends all fields
```

Or update only changed fields:

```python
alice.email = "alice@latest.com"
graph.update(alice, only_dirty=True)  # Only sends email
```

## Delete Entities

```python
# Delete a vertex (DETACH DELETE removes connected edges too)
diana = graph.query(Person).filter_by(name="Diana").one()
graph.delete(diana)
print(diana.graph_id)  # None
```

## Traverse the Graph

`graph.traverse()` follows edges from a vertex. Results are automatically converted to model instances when the vertex/edge label matches a defined model class:

```python
# Who does Alice know? (outbound KNOWS edges)
alice_friends = graph.traverse(alice, "KNOWS", direction="outbound")
# [Person(name='Bob', age=25), Person(name='Charlie', age=35)]

# Who knows Bob? (inbound KNOWS edges)
who_knows_bob = graph.traverse(bob, "KNOWS", direction="inbound")
# [Person(name='Alice', age=30)]
```

You can also pass `target_class` to force hydration into a specific model:

```python
friends = graph.traverse(
    alice, "KNOWS",
    direction="outbound",
    target_class=Person
)
```

If a result's label doesn't match any defined model class, it falls back to a raw dict.

## Raw Cypher Queries

For complex queries, use `graph.cypher()`. Results that are vertices or edges are automatically converted to model instances when their label matches a defined model class.

When you pass `columns=`, results are returned as dicts keyed by your column names (instead of generic `col_0`, `col_1` keys), and scalar values like `{"value": 3}` are automatically unwrapped:

```python
# Vertex results are auto-hydrated into model instances
results = graph.cypher(
    "MATCH (n:Person) WHERE n.name = $name RETURN n",
    name="Alice"
)
alice = results[0]  # Person(name='Alice', age=30)
print(alice.name)   # "Alice"

# Scalar results with named columns
results = graph.cypher(
    "MATCH (n:Person) RETURN count(n)",
    columns=["total"]
)
total = results[0]["total"]  # 3

# Multi-column results with named keys and auto-hydration
results = graph.cypher(
    "MATCH (a:Person)-[e:KNOWS]->(b:Person) RETURN a, e, b",
    columns=["a", "e", "b"]
)
row = results[0]
row["a"]  # Person instance
row["e"]  # Knows instance
row["b"]  # Person instance

# Scalar columns are unwrapped automatically
results = graph.cypher(
    "MATCH (n:Person) RETURN n.name, n.age",
    columns=["name", "age"]
)
results[0]  # {"name": "Alice", "age": 30}
```

Column names are automatically quoted in SQL, so reserved words like `count`, `order`, etc. work safely as column names.

## Bulk Operations

For loading large datasets, use bulk insert (bypasses Cypher for speed):

```python
people = [
    Person(name="Eve", age=22),
    Person(name="Frank", age=40),
    Person(name="Grace", age=33),
]
graph.bulk_add(people)

# All have graph_ids now
for p in people:
    print(f"{p.name}: {p.graph_id}")
```

Bulk edge insert:

```python
triples = [
    (eve, Knows(since=2022, relationship_type="friend"), frank),
    (frank, Knows(since=2023, relationship_type="colleague"), grace),
]
graph.bulk_add_edges(triples)
```

## Bulk Mutations via Query Builder

Update or delete multiple entities at once:

```python
# Update all people older than 35
updated = (
    graph.query(Person)
    .filter("n.age > $age", age=35)
    .update(email="senior@example.com")
)
print(f"Updated {updated} records")

# Delete specific people
deleted = (
    graph.query(Person)
    .filter("n.name IN $names", names=["Eve", "Frank", "Grace"])
    .delete()
)
print(f"Deleted {deleted} records")
```

## Events

Register hooks for graph operations:

```python
@listens_for(Person, ["pre_add", "post_add"])
def on_person_add(target, event, **kwargs):
    print(f"Event: {event} for {target.name}")

person = Person(name="EventTest", age=99)
graph.add(person)
# Prints:
#   Event: pre_add for EventTest
#   Event: post_add for EventTest
```

See the [Events](/docs/events) page for more details.

## Cleanup

```python
db.drop_graph("social")
db.close()
```

## Next Steps

- [Query Builder](/docs/query-builder) -- Full query API reference
- [Relationships](/docs/relationships) -- Declarative relationship navigation
- [Events](/docs/events) -- Pre/post operation hooks
- [API Reference](/docs/api-reference) -- Complete class and method reference
