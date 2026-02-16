# Query Builder

The query builder provides a fluent API for constructing Cypher queries. Create a query with `graph.query(Model)` and chain methods to build your query.

## Creating a Query

```python
q = graph.query(Person)
```

This creates a `Query[Person]` bound to the graph. The query targets the `Person` label.

## Filtering

### filter_by() -- Equality Conditions

The simplest way to filter. Pass field names and values as keyword arguments:

```python
# Single condition
alice = graph.query(Person).filter_by(name="Alice").one()

# Multiple conditions (AND)
result = graph.query(Person).filter_by(name="Alice", age=30).one()
```

### filter() -- Raw Cypher Conditions

For more complex conditions, use `filter()` with Cypher syntax. Use `n` as the node variable and `$param` for parameters:

```python
# Greater than
older = graph.query(Person).filter("n.age > $min", min=25).all()

# Multiple conditions
results = (
    graph.query(Person)
    .filter("n.age > $min AND n.name <> $excluded", min=20, excluded="Bob")
    .all()
)

# String matching
results = graph.query(Person).filter("n.name STARTS WITH $prefix", prefix="Al").all()
```

### OR Conditions

By default, multiple `filter()` calls are joined with AND. Pass `_or=True` for OR:

```python
results = (
    graph.query(Person)
    .filter("n.age < $young", young=20)
    .filter("n.age > $old", _or=True, old=50)
    .all()
)
# People younger than 20 OR older than 50
```

### Combining filter() and filter_by()

```python
results = (
    graph.query(Person)
    .filter_by(name="Alice")
    .filter("n.age > $min", min=25)
    .all()
)
```

## Sorting

Use `sort()` with the `n.` prefix for node properties:

```python
# Ascending (default)
graph.query(Person).sort("n.name").all()

# Descending
graph.query(Person).sort("n.age DESC").all()
```

## Pagination

```python
# Limit results
graph.query(Person).limit(10).all()

# Limit with offset (skip)
graph.query(Person).sort("n.name").limit(10, skip=20).all()
```

## Execution Methods

### all()

Returns a list of all matching model instances:

```python
people: list[Person] = graph.query(Person).all()
```

### first()

Returns the first match or `None`:

```python
person: Person | None = graph.query(Person).filter_by(name="Alice").first()
```

### one()

Returns exactly one result. Raises `EntityNotFoundError` if no results, `MultipleResultsError` if more than one:

```python
from age_orm.exceptions import EntityNotFoundError, MultipleResultsError

try:
    alice = graph.query(Person).filter_by(name="Alice").one()
except EntityNotFoundError:
    print("Not found")
except MultipleResultsError:
    print("Multiple matches")
```

### count()

Returns the count of matching entities without loading them:

```python
total = graph.query(Person).count()
filtered = graph.query(Person).filter("n.age > $min", min=30).count()
```

### iterator()

Yields results one at a time (sync only):

```python
for person in graph.query(Person).iterator():
    print(person.name)
```

## Lookups

### by_id()

Look up an entity by its AGE graph ID:

```python
person = graph.query(Person).by_id(844424930131969)
```

### by_property()

Look up by a single property value:

```python
alice = graph.query(Person).by_property("name", "Alice")
```

## Bulk Mutations

### update()

Update all matching entities. Returns the count of updated records:

```python
updated = (
    graph.query(Person)
    .filter("n.age > $min", min=50)
    .update(email="senior@example.com")
)
```

### delete()

Delete all matching entities (uses DETACH DELETE). Returns the count of deleted records:

```python
deleted = (
    graph.query(Person)
    .filter_by(name="OldAccount")
    .delete()
)
```

## Raw Cypher via Query

Execute arbitrary Cypher through the query's graph binding:

```python
results = graph.query(Person).cypher(
    "MATCH (n:Person)-[:KNOWS]->(m:Person) RETURN n.name, m.name"
)
```

## Generated Cypher

You can inspect the Cypher that will be generated:

```python
q = graph.query(Person).filter("n.age > $min", min=25).sort("n.name").limit(10)
print(str(q))
# MATCH (n:Person)
# WHERE n.age > 25
# RETURN n
# ORDER BY n.name
# LIMIT 10
```

## Async Query

The `AsyncQuery` class provides the same filtering and sorting interface, but execution methods are async:

```python
async with AsyncDatabase("postgresql://...") as db:
    graph = await db.graph("social", create=True)
    q = await graph.query(Person)

    people = await q.filter("n.age > $min", min=25).all()
    alice = await q.filter_by(name="Alice").one()
    count = await q.count()
```
