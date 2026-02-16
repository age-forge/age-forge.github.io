# Relationships

age-orm supports declarative relationships that lazy-load connected vertices when accessed. This lets you navigate the graph using standard Python attribute access.

## Defining Relationships

Use the `relationship()` function as a field default on your model:

```python
from age_orm import Vertex, Edge, relationship

class Person(Vertex):
    __label__ = "Person"
    name: str
    age: int
    friends: list["Person"] = relationship("Person", "KNOWS", direction="outbound")
    employer: "Company" = relationship("Company", "WORKS_AT", uselist=False)

class Company(Vertex):
    __label__ = "Company"
    name: str
    industry: str

class Knows(Edge):
    __label__ = "KNOWS"
    since: int

class WorksAt(Edge):
    __label__ = "WORKS_AT"
    role: str
```

## relationship() Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target_class` | `type` or `str` | required | Target vertex class or fully qualified class name string |
| `edge_label` | `str` | required | AGE edge label to traverse |
| `direction` | `str` | `"outbound"` | `"outbound"`, `"inbound"`, or `"any"` |
| `uselist` | `bool` | `True` | `True` returns a list, `False` returns a single instance or None |
| `cache` | `bool` | `True` | Cache the result after first load |
| `depth` | `int` | `1` | Maximum traversal depth |

## Usage

Once a vertex is loaded from the database, access relationship fields like normal attributes:

```python
alice = graph.query(Person).filter_by(name="Alice").one()

# Triggers a Cypher query on first access
friends = alice.friends  # list[Person]
for friend in friends:
    print(friend.name)

# Single result (uselist=False)
company = alice.employer  # Company or None
if company:
    print(f"Works at {company.name}")
```

## Direction

- `"outbound"` (default) -- follows edges going **from** the vertex
- `"inbound"` -- follows edges coming **to** the vertex
- `"any"` -- follows edges in either direction

```python
class Person(Vertex):
    __label__ = "Person"
    name: str
    # People I know
    friends: list["Person"] = relationship("Person", "KNOWS", direction="outbound")
    # People who know me
    known_by: list["Person"] = relationship("Person", "KNOWS", direction="inbound")
    # Both directions
    connections: list["Person"] = relationship("Person", "KNOWS", direction="any")
```

## Caching

By default, relationship results are cached after the first access (`cache=True`). Subsequent accesses return the cached value without querying the database.

Set `cache=False` to always query fresh results:

```python
class Person(Vertex):
    __label__ = "Person"
    name: str
    friends: list["Person"] = relationship(
        "Person", "KNOWS",
        direction="outbound",
        cache=False  # Always fetch fresh
    )
```

## Depth

The `depth` parameter controls how many hops the traversal makes:

```python
class Person(Vertex):
    __label__ = "Person"
    name: str
    # Direct friends only
    friends: list["Person"] = relationship("Person", "KNOWS", depth=1)
    # Friends of friends (up to 3 hops)
    extended_network: list["Person"] = relationship("Person", "KNOWS", depth=3)
```

## Detached Instances

Accessing a relationship on a vertex that isn't bound to a database raises `DetachedInstanceError`:

```python
from age_orm.exceptions import DetachedInstanceError

person = Person(name="Test", age=25)  # Not saved to DB
try:
    friends = person.friends
except DetachedInstanceError:
    print("Save the entity first!")
```

## String References

You can use a fully qualified string for the target class to avoid circular imports:

```python
class Person(Vertex):
    __label__ = "Person"
    name: str
    friends: list["Person"] = relationship(
        "myapp.models.Person",  # Resolved at access time via pydoc.locate()
        "KNOWS"
    )
```

## graph.traverse()

For programmatic traversal without declaring relationships, use `graph.traverse()`. Results are automatically converted to model instances when the label matches a defined model class:

```python
# Outbound traversal -- returns Person instances automatically
friends = graph.traverse(alice, "KNOWS", direction="outbound")
# [Person(name='Bob', age=25), Person(name='Charlie', age=35)]

# Inbound traversal
admirers = graph.traverse(alice, "KNOWS", direction="inbound")
# [Person(name='...', ...)]
```

You can also pass `target_class` to force hydration into a specific model class:

```python
friends = graph.traverse(
    alice, "KNOWS",
    direction="outbound",
    target_class=Person
)
```

If a result's label doesn't match any defined model class, a raw dict is returned instead.

## graph.expand()

`expand()` populates all relationships on a vertex at once, grouped by edge label. Both edge and target data are automatically converted to model instances when their labels match defined model classes:

```python
graph.expand(alice, direction="any", depth=1)

# Access via _relations dict -- edges and targets are model instances
for edge_label, connections in alice._relations.items():
    print(f"\n{edge_label}:")
    for conn in connections:
        edge = conn["edge"]    # e.g., Knows(since=2020, ...)
        target = conn["target"]  # e.g., Person(name='Bob', ...)
        print(f"  -[{edge.label}]-> {target.name}")
```

## model_dump() Excludes Relationships

Relationship fields are automatically excluded from `model_dump()` to prevent serialization issues:

```python
alice = graph.query(Person).filter_by(name="Alice").one()
data = alice.model_dump()
# {'name': 'Alice', 'age': 30}  -- no 'friends' or 'employer' keys
```
