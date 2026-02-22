# API Reference

Quick reference for all public classes and functions in age-orm.

## Models

### Vertex

Base class for graph vertices.

```python
from age_orm import Vertex

class Person(Vertex):
    __label__ = "Person"  # Optional, defaults to class name
    name: str
    age: int
```

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `graph_id` | `int \| None` | AGE-assigned ID (read-only after save) |
| `label` | `str` | The AGE label |
| `is_dirty` | `bool` | Whether fields have been modified since last save |

**Methods:**
| Method | Returns | Description |
|--------|---------|-------------|
| `model_dump()` | `dict` | Serialize to dict (excludes relationship fields) |
| `dirty_fields_dump()` | `dict` | Only modified fields as dict |

### Edge

Base class for graph edges.

```python
from age_orm import Edge

class Knows(Edge):
    __label__ = "KNOWS"
    since: int
```

Inherits all `Vertex` properties plus:

| Property | Type | Description |
|----------|------|-------------|
| `start_id` | `int \| None` | Source vertex graph ID |
| `end_id` | `int \| None` | Target vertex graph ID |

## Database

### Database (sync)

```python
from age_orm import Database

db = Database(dsn, **pool_kwargs)
```

| Method | Returns | Description |
|--------|---------|-------------|
| `graph(name, create=False)` | `Graph` | Get a graph handle. Creates if `create=True`. |
| `create_graph(name)` | `Graph` | Create a new graph. Raises `GraphExistsError` if exists. |
| `drop_graph(name, cascade=True)` | `None` | Drop a graph. |
| `graph_exists(name)` | `bool` | Check if a graph exists. |
| `list_graphs()` | `list[str]` | List all graph names. |
| `close()` | `None` | Close the connection pool. |

Supports context manager: `with Database(...) as db:`

### AsyncDatabase

Async mirror of `Database`. All methods are `async`. Supports `async with AsyncDatabase(...) as db:`.

## Graph

### Graph (sync)

| Method | Returns | Description |
|--------|---------|-------------|
| `add(vertex)` | `Vertex` | Create a vertex in the graph. |
| `update(entity, only_dirty=False)` | `Vertex \| Edge` | Update an existing entity. |
| `delete(entity)` | `None` | Delete an entity (DETACH DELETE for vertices). |
| `connect(from_v, edge, to_v)` | `Edge` | Create an edge between two vertices. |
| `query(model_class)` | `Query[T]` | Create a query builder. |
| `cypher(statement, columns=None, **params)` | `list` | Execute raw Cypher. Auto-hydrates vertex/edge results into model instances. When `columns` is provided, results use named keys instead of `col_0`/`col_1` and scalar values are unwrapped from `{"value": x}`. Column names are quoted in SQL to avoid reserved-word conflicts. |
| `traverse(vertex, edge_label, ...)` | `list` | Traverse from a vertex along edges. Auto-hydrates results into model instances. |
| `expand(vertex, ...)` | `None` | Populate vertex._relations with hydrated model instances. |
| `bulk_add(entities)` | `list[Vertex]` | Bulk insert vertices via SQL. |
| `bulk_add_edges(triples)` | `list[Edge]` | Bulk insert edges via SQL. |
| `ensure_label(model_class, kind)` | `None` | Create vertex/edge label if missing. |
| `create_index(model_class, field, unique=False)` | `None` | Create PostgreSQL index on property. |

### AsyncGraph

Async mirror. Has `add`, `update`, `delete`, `connect`, `query`, `cypher`, `ensure_label`. Does **not** have `bulk_add`, `bulk_add_edges`, `expand`, `traverse`, or `create_index`.

## Query Builder

### Query (sync)

| Method | Returns | Description |
|--------|---------|-------------|
| `filter(condition, _or=False, **kwargs)` | `Query` | Add Cypher filter condition. |
| `filter_by(_or=False, **kwargs)` | `Query` | Add equality filter. |
| `sort(field)` | `Query` | Add sort clause (e.g., `"n.name DESC"`). |
| `limit(count, skip=0)` | `Query` | Set limit and offset. |
| `returns(*fields)` | `Query` | Set return projection. |
| `all()` | `list[T]` | Execute and return all matches. |
| `first()` | `T \| None` | Return first match or None. |
| `one()` | `T` | Return exactly one match (raises on 0 or >1). |
| `count()` | `int` | Return count of matches. |
| `iterator()` | `Iterator[T]` | Yield results one at a time. |
| `by_id(graph_id)` | `T \| None` | Look up by AGE graph ID. |
| `by_property(field, value)` | `T \| None` | Look up by property. |
| `update(**kwargs)` | `int` | Bulk update matching entities. |
| `delete()` | `int` | Bulk delete matching entities. |

### AsyncQuery

Same filtering/sorting interface. Execution methods (`all`, `first`, `one`, `count`, `by_id`, `by_property`, `update`, `delete`) are all `async`.

## Relationships

### relationship()

```python
from age_orm import relationship

field: list[TargetModel] = relationship(
    target_class,     # type or "module.Class" string
    edge_label,       # AGE edge label
    direction="outbound",  # "outbound", "inbound", "any"
    uselist=True,     # True=list, False=single or None
    cache=True,       # Cache after first load
    depth=1,          # Max traversal depth
)
```

## Events

### listen()

```python
from age_orm import listen

listen(TargetClass, event_name_or_list, handler_fn)
```

### @listens_for()

```python
from age_orm import listens_for

@listens_for(TargetClass, event_name_or_list)
def handler(target, event, **kwargs):
    ...
```

**Events:** `pre_add`, `post_add`, `pre_update`, `post_update`, `pre_delete`, `post_delete`

## Exceptions

All exceptions inherit from `AgeORMError`:

| Exception | Description |
|-----------|-------------|
| `GraphNotFoundError` | Graph does not exist |
| `GraphExistsError` | Creating a graph that already exists |
| `EntityNotFoundError` | Entity lookup returns no results or entity has no graph_id |
| `MultipleResultsError` | `one()` query returns more than one result |
| `DetachedInstanceError` | Accessing relationship on entity not bound to database |

```python
from age_orm.exceptions import (
    AgeORMError,
    GraphNotFoundError,
    GraphExistsError,
    EntityNotFoundError,
    MultipleResultsError,
    DetachedInstanceError,
)
```

## Source Code

- **Repository:** [github.com/age-forge/age-orm](https://github.com/age-forge/age-orm)
