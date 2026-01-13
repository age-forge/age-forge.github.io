# About AGE Forge

AGE Forge is a community initiative to build tools, resources, and libraries for the [Apache AGE](https://age.apache.org/) ecosystem.

## Mission

Make Apache AGE a first-class choice for graph database applications by providing:

- Production-ready tools (ORMs, client libraries)
- Honest, reproducible benchmarks
- Quality documentation and tutorials
- Active community support

## Why AGE?

Apache AGE brings graph database capabilities to PostgreSQL. This matters most when **PostgreSQL is already your primary database**:

### The PostgreSQL Advantage

If you're already running PostgreSQL, adding AGE means:

- **No new infrastructure** - No separate database cluster to deploy, secure, or maintain
- **Existing ops work unchanged** - Your backups, monitoring, replication, and connection pooling cover graph data automatically
- **Single source of truth** - Relational and graph data live together with full ACID guarantees
- **Unified access control** - PostgreSQL roles and permissions apply to graph data
- **Lower TCO** - One database to license, host, and operate instead of two

### Technical Benefits

- **Open Source** - Apache 2.0 license, no vendor lock-in
- **Cypher Support** - Industry-standard graph query language
- **Hybrid Queries** - Combine graph traversals with SQL in a single query
- **ACID Transactions** - Graph mutations participate in PostgreSQL transactions
- **PostgreSQL Ecosystem** - Works with PgBouncer, pgAdmin, existing ORMs, and all your favorite tools

## Background

This project started from practical need. After creating [arango-orm](https://github.com/kashifpk/arango-orm) for ArangoDB, concerns about licensing led to exploring alternatives. Apache AGE emerged as the most promising open-source option.

Rather than just switching, we decided to:
1. **Benchmark fairly** - Understand where AGE excels and where it needs work
2. **Build tools** - Create the libraries developers need
3. **Share openly** - Document findings for the community

## Maintainer

**Kashif Iftikhar**
- GitHub: [@kashifpk](https://github.com/kashifpk)
- Projects: [arango-orm](https://github.com/kashifpk/arango-orm), [compulife.pk](https://compulife.pk)

## Contributing

AGE Forge is open to contributions of all kinds:

- **Code** - Help build AgeORM, benchmarks, or tools
- **Documentation** - Improve guides and tutorials
- **Testing** - Test tools with your use cases
- **Feedback** - Share your experiences with AGE

Start by exploring our [GitHub organization](https://github.com/age-forge).

## License

All AGE Forge projects are released under the [MIT License](https://opensource.org/licenses/MIT) unless otherwise noted.
