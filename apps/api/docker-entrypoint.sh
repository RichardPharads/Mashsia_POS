#!/bin/sh
set -e

# Keep container startup simple and predictable.
# Schema migrations/seeding are run explicitly via package scripts.

exec "$@"

