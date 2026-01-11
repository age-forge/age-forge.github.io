# Benchmarks

Fair, reproducible performance comparisons between Apache AGE and other graph databases.

## Philosophy

Good benchmarks require:

1. **Equivalent setups** - Both databases run in containers with similar resource limits
2. **Fair comparison methods** - Use each database's recommended bulk import, not artificially slow methods
3. **Real-world data** - Test with actual application datasets, not synthetic data
4. **Reproducibility** - All code and data available for independent verification

## Current Benchmarks

### AGE vs ArangoDB (January 2025)

Tested with 1.6 million records from a production application.

| Metric | AGE | ArangoDB | Winner |
|--------|-----|----------|--------|
| Bulk Import | 57.72s | 38.07s | ArangoDB (1.5x) |
| Point Lookup | 1.02ms | 5.44ms | AGE (5x) |
| Text Search | 1.64ms | 53.33ms | AGE (32x) |
| Edge Traversal | 145.90ms | 6.81ms | ArangoDB (21x) |

[Read the full analysis →](/blog/age-vs-arangodb-benchmark)

## Planned Benchmarks

- [ ] Deep traversal (3+ hops) performance
- [ ] Concurrent query throughput
- [ ] Write-heavy workload comparison
- [ ] Memory usage under load
- [ ] Index performance comparison

## Methodology

### Test Environment

| Database | Container Image | Port |
|----------|-----------------|------|
| Apache AGE | `apache/age:release_PG17_1.6.0` | 5433 |
| ArangoDB | `arangodb:3.11` | 8530 |

### Import Methods

We use **equivalent bulk methods** for each database:

- **AGE:** Batch INSERT (500 rows per statement)
- **ArangoDB:** python-arango batch API

This ensures a fair comparison. Individual Cypher queries would unfairly penalize AGE.

## Code & Data

Benchmark code and datasets will be published to:

**Repository:** [github.com/age-forge/age-benchmarks](https://github.com/age-forge/age-benchmarks) *(coming soon)*

## Request a Benchmark

Have a specific comparison you'd like to see? Open an issue on GitHub with:

- The databases/query types you want compared
- Your use case context
- Any specific metrics you care about
