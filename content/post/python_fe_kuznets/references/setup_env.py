"""Bootstrap the local environment for tutorial.qmd.

Invoked by Quarto's pre-render hook (see _quarto.yml). Creates a hermetic
.venv/ next to this script, installs pinned packages plus jupyter + ipykernel
into it, registers a named Jupyter kernel (`python_fe_kuznets-tutorial`) that points at
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
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

GET_PIP_URL = "https://bootstrap.pypa.io/get-pip.py"

# Direct imports from script.py (alphabetised) plus Intel-override transitive
# pins for numba/llvmlite (triggered by pyfixest on macOS Intel — newer numba
# releases dropped Intel wheels and would force a slow source build) plus the
# jupyter + ipykernel bootstrap entries needed for kernel registration.
PINNED: dict[str, str] = {
    "great_tables": "0.21.0",
    "matplotlib":   "3.8.3",
    "numpy":        "1.26.4",
    "pandas":       "2.2.1",
    "pyfixest":     "0.50.1",
    # Last numba+llvmlite releases that ship macOS Intel wheels. pyfixest
    # only requires numba>=0.58.0, so this satisfies its constraint while
    # avoiding the source build on macOS Intel that newer numba would force.
    "llvmlite":     "0.45.0",
    "numba":        "0.62.1",
    "jupyter":      "1.1.1",
    "ipykernel":    "6.29.3",
}

KERNEL_NAME = "python_fe_kuznets-tutorial"
KERNEL_DISPLAY = "Python FE Kuznets Tutorial"

THIS_DIR = Path(__file__).resolve().parent
VENV_DIR = THIS_DIR / ".venv"


def venv_python(venv_dir: Path) -> Path:
    if os.name == "nt":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def _venv_matches_outer(py: Path) -> bool:
    """True iff the venv's Python is healthy and has the same major.minor as ours."""
    try:
        result = subprocess.run(
            [str(py), "-c",
             "import sys; print(sys.version_info.major, sys.version_info.minor)"],
            capture_output=True, text=True, timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return False
    if result.returncode != 0:
        return False
    try:
        major, minor = map(int, result.stdout.split())
    except ValueError:
        return False
    return (major, minor) == sys.version_info[:2]


def ensure_venv() -> None:
    py = venv_python(VENV_DIR)
    if py.exists() and _venv_matches_outer(py):
        return
    if VENV_DIR.exists():
        print(f"  rebuilding stale venv at {VENV_DIR}")
        shutil.rmtree(VENV_DIR)
    else:
        print(f"  creating venv at {VENV_DIR}")
    # Subprocess CLI `python -m venv` (not the EnvBuilder API): on uv-managed
    # standalone CPython, the API path produces a venv whose child python errors
    # with `Library not loaded: @rpath/libpython3.X.dylib`, while the CLI path
    # works. --without-pip bypasses ensurepip; --copies makes the venv self-
    # contained (vs the CLI's default --symlinks), so that the verification
    # chunk in tutorial.qmd, which does Path(sys.executable).resolve(), sees a
    # path inside .venv/ rather than the resolved-through symlink target.
    subprocess.check_call(
        [sys.executable, "-m", "venv", "--without-pip", "--copies", str(VENV_DIR)]
    )


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


SUPPORTED_PY = {(3, 10), (3, 11), (3, 12), (3, 13)}

_PROBE_SCRIPT = (
    "import sys; from xml.parsers import expat; "
    "assert sys.version_info[:2] in {(3,10),(3,11),(3,12),(3,13)}"
)


def _probe_candidate(path: str) -> bool:
    # Cheap check: version + pyexpat. Most rejects fail here in <1s.
    try:
        result = subprocess.run(
            [path, "-c", _PROBE_SCRIPT],
            capture_output=True, timeout=5,
        )
        if result.returncode != 0:
            return False
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False

    # Expensive check: can this Python be the base for a working stdlib venv?
    # Some Pythons pass the cheap check but produce broken venvs (notably
    # uv-managed standalone CPython, where a --copies venv's child python
    # errors with `Library not loaded: @rpath/libpython3.X.dylib`). We mirror
    # `ensure_venv()` exactly: create a --copies --without-pip test venv and
    # run a subprocess from the new python (so the rpath failure is exposed).
    try:
        with tempfile.TemporaryDirectory() as tmp:
            test_venv = Path(tmp) / "v"
            create = subprocess.run(
                [path, "-m", "venv", "--without-pip", "--copies", str(test_venv)],
                capture_output=True, timeout=30,
            )
            if create.returncode != 0:
                return False
            test_py = test_venv / (
                "Scripts/python.exe" if os.name == "nt" else "bin/python"
            )
            # Exercise an inner subprocess too: that pattern is what eventually
            # SIGABRTs on uv-standalone venvs even when a plain -c "print(...)"
            # would succeed.
            run = subprocess.run(
                [str(test_py), "-c",
                 "import subprocess, sys; "
                 "r = subprocess.run([sys.executable, '-c', \"print('ok')\"], "
                 "capture_output=True, text=True, timeout=5); "
                 "assert r.returncode == 0 and r.stdout.strip() == 'ok'"],
                capture_output=True, timeout=10,
            )
            return run.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def find_compatible_python() -> str | None:
    """Scan common Python install locations for a 3.10-3.13 with intact pyexpat."""
    home = Path.home()
    seen: set[str] = set()
    candidates: list[str] = []

    # PATH-resolved version-specific shims (most likely to be on the user's PATH).
    for v in ("3.13", "3.12", "3.11", "3.10"):
        found = shutil.which(f"python{v}")
        if found:
            candidates.append(found)

    # Homebrew Intel and Apple Silicon prefixes.
    for prefix in ("/usr/local", "/opt/homebrew"):
        for v in ("3.13", "3.12", "3.11", "3.10"):
            candidates.append(f"{prefix}/opt/python@{v}/bin/python{v}")
            candidates.append(f"{prefix}/bin/python{v}")

    # python.org installer layout.
    for v in ("3.13", "3.12", "3.11", "3.10"):
        candidates.append(
            f"/Library/Frameworks/Python.framework/Versions/{v}/bin/python3"
        )

    # Conda/miniforge/anaconda base + envs.
    conda_bases = [
        home / "miniforge3", home / "miniconda3",
        home / "anaconda3", home / "opt" / "anaconda3",
    ]
    for base in conda_bases:
        if not base.exists():
            continue
        candidates.append(str(base / "bin" / "python3"))
        envs_dir = base / "envs"
        if envs_dir.exists():
            for env in sorted(envs_dir.iterdir()):
                py = env / "bin" / "python3"
                if py.exists():
                    candidates.append(str(py))

    # Skip the current executable to avoid an infinite re-launch loop.
    here = os.path.realpath(sys.executable)
    for cand in candidates:
        if not cand or cand in seen:
            continue
        seen.add(cand)
        real = os.path.realpath(cand) if os.path.exists(cand) else ""
        if not real or real == here:
            continue
        if _probe_candidate(cand):
            return cand
    return None


def preflight() -> None:
    suffix = (
        "\nOnce you have a working Python 3.10-3.13, re-run:\n"
        "  python3 setup_env.py    (or use the absolute path to that Python)\n"
    )

    version_unsupported = sys.version_info[:2] not in SUPPORTED_PY
    pyexpat_error: ImportError | None = None
    if not version_unsupported:
        try:
            from xml.parsers import expat  # noqa: F401
        except ImportError as e:
            pyexpat_error = e

    # Even when version + pyexpat pass, the outer Python may produce a broken
    # venv (uv-managed standalone CPython has an @rpath issue where the venv's
    # child python errors with `Library not loaded: @rpath/libpython3.X.dylib`).
    # Use the same probe `find_compatible_python` uses on alternatives.
    venv_broken = False
    if not version_unsupported and pyexpat_error is None:
        if not _probe_candidate(sys.executable):
            venv_broken = True

    if not version_unsupported and pyexpat_error is None and not venv_broken:
        return

    # Outer Python is unfit. Try to relaunch with a working one before erroring.
    alt = find_compatible_python()
    if alt:
        ver = ".".join(map(str, sys.version_info[:3]))
        print(
            f"Note: outer Python {ver} at {sys.executable} is unsupported.\n"
            f"Found compatible Python: {alt}\n"
            f"Relaunching setup_env.py with it...\n",
            file=sys.stderr,
        )
        result = subprocess.run(
            [alt, str(Path(__file__).resolve()), *sys.argv[1:]]
        )
        sys.exit(result.returncode)

    # No alternative — fall through to the detailed errors.
    if venv_broken and not version_unsupported and pyexpat_error is None:
        ver = ".".join(map(str, sys.version_info[:3]))
        print(
            f"ERROR: this Python cannot produce a working hermetic venv.\n"
            f"You ran setup_env.py with Python {ver} at {sys.executable}.\n\n"
            f"Most commonly this is a uv-managed standalone CPython, whose\n"
            f"`python -m venv --copies` produces a venv whose child python\n"
            f"errors with `Library not loaded: @rpath/libpython3.X.dylib`.\n\n"
            f"Fix (any one):\n"
            f"  - Use a non-uv Python: install miniforge, python.org Python,\n"
            f"    or Homebrew `python@3.13`, then re-run with that.\n"
            f"  - From a conda env: `conda deactivate` and try again from a\n"
            f"    clean shell."
            f"{suffix}",
            file=sys.stderr,
        )
        sys.exit(1)

    if version_unsupported:
        ver = ".".join(map(str, sys.version_info[:3]))
        print(
            f"ERROR: this tutorial needs Python 3.10, 3.11, 3.12, or 3.13.\n"
            f"You ran setup_env.py with Python {ver} at {sys.executable}.\n\n"
            f"The pinned `numba`/`llvmlite` wheels (when present) cover\n"
            f"cp310-cp313 only. Python 3.14 has no prebuilt numba wheels yet,\n"
            f"and Python <=3.9 is below the minimum for modern data-science\n"
            f"packages.\n\n"
            f"Install a supported Python (any one):\n"
            f"  - miniforge:  brew install miniforge && conda create -n tut python=3.11 -y\n"
            f"  - python.org: https://www.python.org/downloads/\n"
            f"  - Homebrew:   brew install python@3.13"
            f"{suffix}",
            file=sys.stderr,
        )
    else:
        assert pyexpat_error is not None
        print(
            f"ERROR: this Python cannot load `xml.parsers.expat`. Details:\n\n"
            f"  {pyexpat_error}\n\n"
            f"pip imports `xmlrpc.client` -> `xml.parsers.expat`, so no pip\n"
            f"command will work on this Python. This is most commonly the\n"
            f"Homebrew `python@3.14` formula on macOS: its `pyexpat.so` is\n"
            f"linked against a newer `libexpat` than the system ships at\n"
            f"`/usr/lib/libexpat.1.dylib`.\n\n"
            f"Fix (any one):\n"
            f"  - Use a different Python: e.g. `~/miniforge3/envs/<env>/bin/python3 setup_env.py`\n"
            f"  - Install Python via python.org: https://www.python.org/downloads/\n"
            f"  - Reinstall via Homebrew at a working version:\n"
            f"      brew uninstall python@3.14 && brew install python@3.13 && /usr/local/bin/python3.13 setup_env.py"
            f"{suffix}",
            file=sys.stderr,
        )
    sys.exit(1)


def main() -> None:
    preflight()
    print(f"Setting up tutorial environment for '{KERNEL_NAME}'...")
    ensure_venv()
    ensure_pip_in_venv()
    ensure_packages_in_venv()
    register_kernel()
    ensure_outer_jupyter()
    print("Setup complete. Quarto will now render the tutorial.")


if __name__ == "__main__":
    main()
