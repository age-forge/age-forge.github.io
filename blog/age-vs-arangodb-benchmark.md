# AGE vs ArangoDB: A Fair Benchmark Comparison

*January 2025*

We benchmarked Apache AGE against ArangoDB using a real-world dataset of 1.6 million records. The results reveal interesting trade-offs between these two graph database solutions.

## Background

As someone who previously created [arango-orm](https://github.com/kashifpk/arango-orm) for ArangoDB, I've been exploring alternatives due to ArangoDB's license changes. Apache AGE emerged as a compelling open-source option, combining graph capabilities with PostgreSQL's proven reliability.

But how does it actually perform? Rather than rely on marketing claims, I ran fair benchmarks to find out.

## The Dataset

We used **QuranRef**, a real application dataset containing:

| Collection | Count | Description |
|------------|-------|-------------|
| Surahs | 114 | Quran chapters metadata |
| Ayas | 6,348 | Verses |
| Texts | 733,083 | Deduplicated text content |
| Words | 14,876 | Unique Arabic words |
| HAS edges | 83,755 | Surah→Aya, Aya→Word relationships |
| AYA_TEXT edges | 755,221 | Aya→Text with metadata |

**Total: ~1.6 million records, ~345MB JSON**

## Fair Comparison Setup

Both databases ran in containers with equivalent configurations:

| Database | Container | Bulk Import Method |
|----------|-----------|-------------------|
| Apache AGE | `apache/age:release_PG17_1.6.0` | Batch INSERT (500 rows) |
| ArangoDB | `arangodb:3.11` | `python-arango` batch API |

We used **equivalent bulk import methods** for each database—not individual Cypher queries, which would unfairly penalize AGE.

## Results

### Import Performance

| Metric | AGE | ArangoDB |
|--------|-----|----------|
| Total Time | 57.72s | 38.07s |
| Vertices/sec | 14,683 | 22,256 |
| Edges/sec | 14,537 | 22,046 |

**Winner: ArangoDB (1.5x faster)**

ArangoDB's native document store and optimized import pipeline gives it an edge here.

### Query Performance

| Query Type | AGE | ArangoDB | Winner |
|------------|-----|----------|--------|
| Point Lookup | 1.02ms | 5.44ms | AGE (5x) |
| Text Search | 1.64ms | 53.33ms | AGE (32x) |
| Edge Traversal | 145.90ms | 6.81ms | ArangoDB (21x) |

### Analysis

**AGE excels at:**
- Point lookups (PostgreSQL's B-tree indexes)
- Text search (PostgreSQL's full-text capabilities)
- SQL-style queries (it's PostgreSQL under the hood)

**ArangoDB excels at:**
- Graph traversals (optimized edge storage)
- Bulk imports (native document handling)
- Multi-hop queries (graph-first architecture)

## Key Takeaways

1. **There's no universal winner.** Choose based on your workload.

2. **Text-heavy applications favor AGE.** If you're doing lots of text search or filtering alongside graph operations, AGE's PostgreSQL foundation shines.

3. **Traversal-heavy applications favor ArangoDB.** For social networks, recommendation engines, or deep graph analytics, ArangoDB's graph-first design pays off.

4. **AGE gives you PostgreSQL.** That means ACID transactions, mature tooling, and the ability to combine graph queries with relational data.

5. **Import approach matters.** Individual Cypher queries are ~100x slower than bulk methods. Always use batch imports for loading data.

## What's Next

We're continuing to explore AGE performance with:
- Deeper traversals (3+ hops)
- Concurrent query benchmarks
- Write-heavy workloads

We're also building [AgeORM](/projects/age-orm), a Python ORM for AGE to make development easier.

## Resources

- [Full benchmark code and data](https://github.com/age-forge/age-benchmarks) *(coming soon)*
- [Apache AGE documentation](https://age.apache.org/docs/)
- [ArangoDB documentation](https://www.arangodb.com/docs/)

---

*Have questions or want to discuss? Open an issue on [GitHub](https://github.com/age-forge).*
