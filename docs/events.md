# Events

age-orm provides a simple event system that lets you hook into graph operations. Use events for validation, auditing, computed fields, or any side effects you need when entities are created, updated, or deleted.

## Available Events

| Event | Triggered By | When |
|-------|-------------|------|
| `pre_add` | `graph.add()`, `graph.connect()` | Before creating a vertex or edge |
| `post_add` | `graph.add()`, `graph.connect()` | After creating a vertex or edge |
| `pre_update` | `graph.update()` | Before updating an entity |
| `post_update` | `graph.update()` | After updating an entity |
| `pre_delete` | `graph.delete()` | Before deleting an entity |
| `post_delete` | `graph.delete()` | After deleting an entity |

## Registering Handlers

### @listens_for Decorator

The most common way to register event handlers:

```python
from age_orm import Vertex, listens_for

class Person(Vertex):
    __label__ = "Person"
    name: str
    age: int

@listens_for(Person, "pre_add")
def validate_person(target, event, **kwargs):
    if target.age < 0:
        raise ValueError("Age cannot be negative")

@listens_for(Person, "post_add")
def log_person_created(target, event, **kwargs):
    print(f"Created: {target.name} (id: {target.graph_id})")
```

### Multiple Events

Register a handler for multiple events at once:

```python
@listens_for(Person, ["pre_add", "pre_update"])
def validate(target, event, **kwargs):
    if not target.name.strip():
        raise ValueError("Name cannot be empty")
```

### listen() Function

The imperative equivalent of `@listens_for`:

```python
from age_orm import listen

def on_delete(target, event, **kwargs):
    print(f"Deleting: {target.name}")

listen(Person, "pre_delete", on_delete)
```

## Handler Signature

Event handlers receive:

| Parameter | Description |
|-----------|-------------|
| `target` | The entity instance being operated on |
| `event` | The event name string (e.g., `"pre_add"`) |
| `**kwargs` | Additional context, always includes `graph=<Graph instance>` |

```python
@listens_for(Person, "post_add")
def on_add(target, event, **kwargs):
    graph = kwargs["graph"]
    print(f"Added {target.name} to graph {graph.name}")
```

## Type-Based Dispatch

Handlers are dispatched based on `isinstance()` checks. A handler registered on a base class fires for all subclasses:

```python
from age_orm import Vertex

@listens_for(Vertex, "pre_add")
def audit_all_creates(target, event, **kwargs):
    """This fires for ALL vertex types."""
    print(f"Creating {type(target).__name__}: {target}")
```

## Use Cases

### Validation

```python
@listens_for(Person, ["pre_add", "pre_update"])
def validate_person(target, event, **kwargs):
    if target.age < 0 or target.age > 150:
        raise ValueError(f"Invalid age: {target.age}")
    if target.email and "@" not in target.email:
        raise ValueError(f"Invalid email: {target.email}")
```

### Audit Logging

```python
import logging
log = logging.getLogger("audit")

@listens_for(Vertex, ["post_add", "post_update", "post_delete"])
def audit_log(target, event, **kwargs):
    log.info(
        "graph=%s event=%s type=%s id=%s",
        kwargs["graph"].name,
        event,
        type(target).__name__,
        target.graph_id,
    )
```

### Computed Fields

```python
from datetime import datetime

class Article(Vertex):
    __label__ = "Article"
    title: str
    content: str
    updated_at: str | None = None

@listens_for(Article, "pre_update")
def set_updated_at(target, event, **kwargs):
    target.updated_at = datetime.now().isoformat()
```
