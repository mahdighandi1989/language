"""Tests for the frontend build configuration (Vite / PostCSS / Tailwind).

- test_build_succeeds: the production build completes without error.
- test_plugins_loaded: the Vite and PostCSS plugins are wired up correctly.
"""
from __future__ import annotations

import subprocess

import pytest

from _build_helpers import (
    DIST_DIR,
    FRONTEND_DIR,
    node_available,
    npm_available,
    run_build,
)


@pytest.mark.skipif(not npm_available(), reason="npm is not installed")
def test_build_succeeds():
    result = run_build(timeout=120)
    assert result.returncode == 0, (
        f"`npm run build` failed (exit {result.returncode}).\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    index_html = DIST_DIR / "index.html"
    assert index_html.is_file(), "build did not produce dist/index.html"

    assets_dir = DIST_DIR / "assets"
    assert assets_dir.is_dir(), "build did not produce dist/assets"
    js_bundles = list(assets_dir.glob("*.js"))
    assert js_bundles, "build did not emit any JS bundle (React plugin?)"


# A small ESM probe that loads the actual config files and asserts that the
# expected plugins are registered. Running it through Node resolves the configs
# exactly the way Vite would, so a missing or renamed plugin fails the test.
_PLUGIN_PROBE = r"""
import viteConfig from './vite.config.js';
import postcssConfig from './postcss.config.js';

const resolved =
  typeof viteConfig === 'function'
    ? await viteConfig({ command: 'build', mode: 'production' })
    : viteConfig;

const pluginNames = (resolved.plugins || [])
  .flat(Infinity)
  .filter(Boolean)
  .map((p) => (p && p.name) || '');

if (!pluginNames.some((n) => n.includes('react'))) {
  console.error('Vite React plugin not loaded. Found:', pluginNames.join(', '));
  process.exit(1);
}

const postcssPlugins = Object.keys((postcssConfig && postcssConfig.plugins) || {});
for (const required of ['tailwindcss', 'autoprefixer']) {
  if (!postcssPlugins.includes(required)) {
    console.error(`PostCSS plugin '${required}' not loaded. Found:`, postcssPlugins.join(', '));
    process.exit(1);
  }
}

console.log('PLUGINS_OK vite=[' + pluginNames.join(',') + '] postcss=[' + postcssPlugins.join(',') + ']');
"""


@pytest.mark.skipif(not node_available(), reason="node is not installed")
def test_plugins_loaded():
    result = subprocess.run(
        ["node", "--input-type=module", "-e", _PLUGIN_PROBE],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, (
        "Build plugins are not loaded correctly.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert "PLUGINS_OK" in result.stdout
