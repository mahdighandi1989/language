# Testing infrastructure

This project uses **pytest** as the backend/integration test framework. The
backend runtime is Node/Express, and the pytest suite boots the real server and
exercises it (no real Gemini credential or network access required — a dummy,
correctly-shaped `GEMINI_API_KEY` is injected by fixtures).

## Layout

| Path | Purpose |
| --- | --- |
| `pytest.ini` (root) | Project-wide pytest config (root suite). |
| `conftest.py` (root) | Shared fixtures: `app`, `client`, `mock_gemini_api`. |
| `tests/` | Root test tree. |
| `tests/unit/`, `tests/integration/`, `tests/e2e/` | Unit / integration / end-to-end suites (each an importable package with `__init__.py`). |
| `tests/conftest.py` | Global fixtures (`app`, `client`, `mock_gemini_api`). |
| `backend/pytest.ini` | Backend-scoped pytest config (`testpaths = tests`). |
| `backend/requirements.txt` | Test tooling: `pytest`, `pytest-cov`, `pytest-mock`. |
| `backend/tests/__init__.py` | Marks `backend/tests` as a package. |
| `backend/tests/conftest.py` | Backend fixtures that mock `GEMINI_API_KEY`. |
| `backend/tests/test_infrastructure.py` | Smoke tests asserting the infra contract. |

## Running

```bash
# Install test tooling (once)
pip install -r backend/requirements.txt
npm install            # backend deps are hoisted to the workspace root

# Backend suite
cd backend && python -m pytest

# Root suite (unit + integration + e2e)
python -m pytest tests/

# With coverage
cd backend && python -m pytest --cov=. --cov-report=term-missing
```

The backend `package.json` exposes these via npm scripts:

```jsonc
"test":     "python -m pytest",
"test:cov": "python -m pytest --cov=. --cov-report=term-missing"
```

## Fixtures

* `app` — metadata about the backend app (paths, dummy env). No process started.
* `client` — boots `backend/server.js` on an ephemeral port and yields the probe
  result; skips cleanly when Node is unavailable.
* `mock_gemini_api` / `mock_gemini_api_key` — patch `GEMINI_API_KEY` with a dummy
  value so credential-gated code paths run fully offline.

## Notes

* `__pycache__/` and `.pytest_cache/` are git-ignored.
* No test depends on a real database, real Gemini API, or any external network
  service — all external dependencies are mocked or use in-memory/dummy data.
