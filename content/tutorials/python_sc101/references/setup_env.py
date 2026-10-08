"""Bootstrap the local environment for tutorial.qmd.

The pre-render hook of Quarto runs this script (see _quarto.yml). It creates a
hermetic .venv/ next to this file, installs the pinned packages plus jupyter
and ipykernel into it, and registers a named Jupyter kernel
(`python_sc101-tutorial`) that points at the Python of the venv. It also makes
sure that the outer Python, the one that Quarto invoked, has the minimal
Jupyter packages that Quarto needs to discover the kernel.

The script is idempotent: after a successful first render, a second run is a
no-op of about one second, because every step stops early when the desired
state already holds.

It needs only the standard library of Python 3.11 or newer. It works on macOS
and Windows, and Linux works as well.
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

# The software stack that produced every number of the post. The direct imports
# of script.py come first, in alphabetical order. The next five packages are
# dependencies of mlsynth, pinned so that a fresh install rebuilds the same stack.
# The scs entry is a macOS Intel override: scs 3.2.9 to 3.3.1 ship no macOS
# x86_64 wheels, so 3.2.8 is the last release that installs there without a
# local build. The bootstrap packages jupyter and ipykernel come last.
PINNED: dict[str, str] = {
    "matplotlib":      "3.10.8",
    "mlsynth":         "1.0.0",
    "numpy":           "2.3.5",
    "pandas":          "3.0.1",
    "scipy":           "1.17.1",
    "statsmodels":     "0.14.6",
    # Dependencies of mlsynth that are pinned for reproducibility.
    "cvxpy":           "1.8.1",
    "pyarrow":         "25.0.0",
    "pydantic":        "2.13.4",
    "scikit-learn":    "1.8.0",
    "scikit-optimize": "0.10.2",
    # Intel override: the last scs release with macOS x86_64 wheels.
    "scs":             "3.2.8",
    # Bootstrap: jupyter and ipykernel register and run the kernel.
    "jupyter":         "1.1.1",
    "ipykernel":       "7.4.0",
}

KERNEL_NAME = "python_sc101-tutorial"
KERNEL_DISPLAY = "Python SC 101 Tutorial"

THIS_DIR = Path(__file__).resolve().parent
VENV_DIR = THIS_DIR / ".venv"


def venv_python(venv_dir: Path) -> Path:
    if os.name == "nt":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def _venv_matches_outer(py: Path) -> bool:
    """True if the Python of the venv is healthy and has our major.minor version."""
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
    # The subprocess CLI `python -m venv`, not the EnvBuilder API: on uv-managed
    # standalone CPython, the API path produces a venv whose child python fails
    # with `Library not loaded: @rpath/libpython3.X.dylib`, while the CLI path
    # works. The flag --without-pip bypasses ensurepip. The flag --copies makes
    # the venv self-contained (the CLI default is --symlinks), so the verification
    # chunk in tutorial.qmd, which calls Path(sys.executable).resolve(), sees a
    # path inside .venv/ rather than the target of a symlink.
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


SUPPORTED_PY = {(3, 11), (3, 12), (3, 13)}

_PROBE_SCRIPT = (
    "import sys; from xml.parsers import expat; "
    "assert sys.version_info[:2] in {(3,11),(3,12),(3,13)}"
)


def _probe_candidate(path: str) -> bool:
    # Cheap check: version and pyexpat. Most rejections happen here in under a second.
    try:
        result = subprocess.run(
            [path, "-c", _PROBE_SCRIPT],
            capture_output=True, timeout=5,
        )
        if result.returncode != 0:
            return False
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False

    # Expensive check: can this Python be the base of a working standard venv?
    # Some Pythons pass the cheap check but produce broken venvs, notably the
    # uv-managed standalone CPython, where the child python of a --copies venv
    # fails with `Library not loaded: @rpath/libpython3.X.dylib`. The check
    # mirrors ensure_venv() exactly: it creates a --copies --without-pip test
    # venv and runs a subprocess from its python, which exposes the rpath failure.
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
            # Run an inner subprocess too: that pattern is what eventually aborts
            # on uv-standalone venvs, even when a plain -c "print(...)" succeeds.
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
    """Scan common install locations for a Python 3.11 to 3.13 with a working pyexpat."""
    home = Path.home()
    seen: set[str] = set()
    candidates: list[str] = []

    # Version-specific shims on the PATH, which are the most likely to exist.
    for v in ("3.13", "3.12", "3.11"):
        found = shutil.which(f"python{v}")
        if found:
            candidates.append(found)

    # Homebrew prefixes on Intel and on Apple Silicon.
    for prefix in ("/usr/local", "/opt/homebrew"):
        for v in ("3.13", "3.12", "3.11"):
            candidates.append(f"{prefix}/opt/python@{v}/bin/python{v}")
            candidates.append(f"{prefix}/bin/python{v}")

    # The layout of the python.org installer.
    for v in ("3.13", "3.12", "3.11"):
        candidates.append(
            f"/Library/Frameworks/Python.framework/Versions/{v}/bin/python3"
        )

    # Conda, miniforge, and anaconda: the base environment and every named one.
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

    # Skip the current executable to avoid an endless relaunch loop.
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
        "\nOnce a working Python 3.11, 3.12, or 3.13 is installed, run again:\n"
        "  python3 setup_env.py    (or use the absolute path to that Python)\n"
    )

    version_unsupported = sys.version_info[:2] not in SUPPORTED_PY
    pyexpat_error: ImportError | None = None
    if not version_unsupported:
        try:
            from xml.parsers import expat  # noqa: F401
        except ImportError as e:
            pyexpat_error = e

    # Even when the version and pyexpat pass, the outer Python may produce a
    # broken venv: in a uv-managed standalone CPython, the child python of the
    # venv fails with `Library not loaded: @rpath/libpython3.X.dylib`. The same
    # probe that find_compatible_python() applies to alternatives checks this.
    venv_broken = False
    if not version_unsupported and pyexpat_error is None:
        if not _probe_candidate(sys.executable):
            venv_broken = True

    if not version_unsupported and pyexpat_error is None and not venv_broken:
        return

    # The outer Python is unfit. Try to relaunch with a working one before failing.
    alt = find_compatible_python()
    if alt:
        ver = ".".join(map(str, sys.version_info[:3]))
        print(
            f"Note: the outer Python {ver} at {sys.executable} is unsupported.\n"
            f"Found a compatible Python: {alt}\n"
            f"Relaunching setup_env.py with it...\n",
            file=sys.stderr,
        )
        result = subprocess.run(
            [alt, str(Path(__file__).resolve()), *sys.argv[1:]]
        )
        sys.exit(result.returncode)

    # No alternative exists, so the detailed errors follow.
    if venv_broken and not version_unsupported and pyexpat_error is None:
        ver = ".".join(map(str, sys.version_info[:3]))
        print(
            f"ERROR: this Python cannot produce a working hermetic venv.\n"
            f"setup_env.py ran with Python {ver} at {sys.executable}.\n\n"
            f"The usual cause is a uv-managed standalone CPython, whose command\n"
            f"`python -m venv --copies` produces a venv whose child python fails\n"
            f"with `Library not loaded: @rpath/libpython3.X.dylib`.\n\n"
            f"Fix (any one):\n"
            f"  - Use a Python that uv does not manage: install miniforge, the\n"
            f"    python.org Python, or Homebrew `python@3.13`, and run it again.\n"
            f"  - From a conda environment: run `conda deactivate`, and try again\n"
            f"    from a clean shell."
            f"{suffix}",
            file=sys.stderr,
        )
        sys.exit(1)

    if version_unsupported:
        ver = ".".join(map(str, sys.version_info[:3]))
        print(
            f"ERROR: this tutorial needs Python 3.11, 3.12, or 3.13.\n"
            f"setup_env.py ran with Python {ver} at {sys.executable}.\n\n"
            f"The pinned stack (numpy 2.3.5, pandas 3.0.1, scipy 1.17.1, and\n"
            f"cvxpy 1.8.1) needs Python 3.11 or newer, and the tutorial supports\n"
            f"Python 3.11, 3.12, and 3.13 only.\n\n"
            f"Install a supported Python (any one):\n"
            f"  - miniforge:  brew install miniforge && conda create -n tut python=3.13 -y\n"
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
            f"pip imports `xmlrpc.client`, which imports `xml.parsers.expat`, so no\n"
            f"pip command works on this Python. The usual cause is the Homebrew\n"
            f"formula `python@3.14` on macOS: its `pyexpat.so` is linked against a\n"
            f"newer `libexpat` than the one at `/usr/lib/libexpat.1.dylib`.\n\n"
            f"Fix (any one):\n"
            f"  - Use another Python, for example `~/miniforge3/envs/<env>/bin/python3 setup_env.py`\n"
            f"  - Install Python from python.org: https://www.python.org/downloads/\n"
            f"  - Reinstall a working version with Homebrew:\n"
            f"      brew uninstall python@3.14 && brew install python@3.13 && /usr/local/bin/python3.13 setup_env.py"
            f"{suffix}",
            file=sys.stderr,
        )
    sys.exit(1)


def write_quarto_environment() -> None:
    # Quarto finds Jupyter kernels through a Python interpreter: QUARTO_PYTHON if
    # it is set, and the python3 on the PATH otherwise. When that python3 is
    # unsupported (for example 3.14, which preflight() relaunched away from), it
    # has no Jupyter, and Quarto reports that the kernel was not found. Quarto
    # loads _environment.local into the environment of every project render, so
    # pointing QUARTO_PYTHON at the .venv here makes a bare `quarto render` work,
    # not only the one-click wrappers. The absolute path depends on the machine,
    # which is what the .local file is for.
    env_file = THIS_DIR / "_environment.local"
    line = f"QUARTO_PYTHON={venv_python(VENV_DIR)}\n"
    if env_file.exists() and env_file.read_text() == line:
        return
    env_file.write_text(line)
    print(f"  wrote {env_file.name} (QUARTO_PYTHON -> .venv)")


def main() -> None:
    preflight()
    print(f"Setting up the tutorial environment for '{KERNEL_NAME}'...")
    ensure_venv()
    ensure_pip_in_venv()
    ensure_packages_in_venv()
    register_kernel()
    ensure_outer_jupyter()
    write_quarto_environment()
    print("Setup complete. Quarto will now render the tutorial.")


if __name__ == "__main__":
    main()
