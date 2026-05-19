"""Bootstrap the local environment for tutorial.qmd.

Invoked by Quarto's pre-render hook (see _quarto.yml). Creates a hermetic
.venv/ next to this script, installs pinned packages plus jupyter + ipykernel
into it, registers a named Jupyter kernel (`pyfixest-tutorial`) that points at
the venv's Python, and ensures the outer Python that Quarto invoked has the
minimal jupyter packages it needs to discover the kernel.

Idempotent: re-running after a successful first render is a no-op (~1 second)
because every step short-circuits when the desired state is already met.

Requires only Python 3.10+ stdlib. Works on macOS and Windows. Linux works
for free.
"""

from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
import urllib.request
import venv
from pathlib import Path

GET_PIP_URL = "https://bootstrap.pypa.io/get-pip.py"

PINNED: dict[str, str] = {
    "numpy":      "1.26.4",
    "pandas":     "2.2.2",
    "matplotlib": "3.9.2",
    # Last numba+llvmlite releases that ship macOS Intel wheels. pyfixest
    # only requires numba>=0.58.0, so this satisfies its constraint while
    # avoiding the source build on macOS Intel that newer numba would force.
    "llvmlite":   "0.45.0",
    "numba":      "0.62.1",
    "pyfixest":   "0.50.1",
    "jupyter":    "1.1.1",
    "ipykernel":  "6.29.5",
}

KERNEL_NAME = "pyfixest-tutorial"
KERNEL_DISPLAY = "PyFixest Tutorial"

THIS_DIR = Path(__file__).resolve().parent
VENV_DIR = THIS_DIR / ".venv"


def venv_python(venv_dir: Path) -> Path:
    if os.name == "nt":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def ensure_venv() -> None:
    py = venv_python(VENV_DIR)
    if py.exists():
        return
    print(f"  creating venv at {VENV_DIR}")
    # with_pip=False bypasses ensurepip (which is missing or broken on some
    # Python builds: e.g., uv-managed standalone distributions, or Pythons
    # that ship a buggy bundled pip wheel). ensure_pip_in_venv() then
    # installs pip via the canonical get-pip.py bootstrap.
    venv.EnvBuilder(with_pip=False, upgrade_deps=False).create(VENV_DIR)


def ensure_pip_in_venv() -> None:
    py = venv_python(VENV_DIR)
    result = subprocess.run(
        [str(py), "-c", "import pip"],
        capture_output=True,
    )
    if result.returncode == 0:
        return
    print(f"  bootstrapping pip in venv via {GET_PIP_URL}")
    get_pip = VENV_DIR / "get-pip.py"
    urllib.request.urlretrieve(GET_PIP_URL, get_pip)
    subprocess.check_call(
        [str(py), str(get_pip), "--quiet", "--disable-pip-version-check"]
    )
    get_pip.unlink(missing_ok=True)


def installed_version(python: Path, pkg: str) -> str | None:
    result = subprocess.run(
        [str(python), "-c",
         f"import importlib.metadata as m; "
         f"print(m.version('{pkg}'))"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None


def ensure_packages_in_venv() -> None:
    py = venv_python(VENV_DIR)
    to_install: list[str] = []
    for pkg, want in PINNED.items():
        have = installed_version(py, pkg)
        if have != want:
            to_install.append(f"{pkg}=={want}")
    if not to_install:
        return
    print(f"  installing into venv: {' '.join(to_install)}")
    subprocess.check_call(
        [str(py), "-m", "pip", "install", "--quiet", "--disable-pip-version-check",
         *to_install]
    )


def register_kernel() -> None:
    py = venv_python(VENV_DIR)
    print(f"  registering kernel '{KERNEL_NAME}'")
    subprocess.check_call(
        [str(py), "-m", "ipykernel", "install",
         "--user",
         "--name", KERNEL_NAME,
         "--display-name", KERNEL_DISPLAY],
        stdout=subprocess.DEVNULL,
    )


def ensure_outer_jupyter() -> None:
    needed = ["jupyter_client", "jupyter_core", "ipykernel"]
    missing = [m for m in needed if importlib.util.find_spec(m) is None]
    if not missing:
        return
    print(f"  installing into outer Python (Quarto discovery): {missing}")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install",
         "--user", "--quiet", "--disable-pip-version-check",
         *missing]
    )


def main() -> None:
    print("Setting up PyFixest tutorial environment...")
    ensure_venv()
    ensure_pip_in_venv()
    ensure_packages_in_venv()
    register_kernel()
    ensure_outer_jupyter()
    print("Setup complete. Quarto will now render the tutorial.")


if __name__ == "__main__":
    main()
