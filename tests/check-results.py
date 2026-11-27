"""Run the notebook in a fresh process and compare the numeric exports."""
import csv
import json
import math
import os
from pathlib import Path
import tempfile

root = Path(__file__).resolve().parent.parent
notebook = json.loads((root / "notebook/bus-corridor-simulator.ipynb").read_text())
os.environ["MPLBACKEND"] = "Agg"


def compare(expected, observed):
    if isinstance(expected, dict):
        assert expected.keys() == observed.keys()
        for key in expected:
            compare(expected[key], observed[key])
    elif isinstance(expected, list):
        assert len(expected) == len(observed)
        for before, after in zip(expected, observed):
            compare(before, after)
    else:
        try:
            before, after = float(expected), float(observed)
        except (TypeError, ValueError):
            assert expected == observed, (expected, observed)
        else:
            assert math.isclose(before, after, rel_tol=1e-10, abs_tol=1e-9), (before, after)


with tempfile.TemporaryDirectory() as directory:
    os.environ["MPLCONFIGDIR"] = str(Path(directory) / "matplotlib")
    os.chdir(directory)
    scope = {}
    for index, cell in enumerate(notebook["cells"]):
        if cell["cell_type"] == "code":
            assert not cell.get("outputs"), "Keep generated outputs outside the tracked notebook."
            exec(compile("".join(cell["source"]), f"<notebook cell {index}>", "exec"), scope)
    for name in ("paired-replications.csv", "policy-effects.csv"):
        relative = Path("data") / name
        with (root / relative).open(newline="") as expected, relative.open(newline="") as observed:
            compare(list(csv.DictReader(expected)), list(csv.DictReader(observed)))
    relative = Path("data/browser-reference.json")
    compare(json.loads((root / relative).read_text()), json.loads(relative.read_text()))
    for name in ("corridor-time-distance", "holding-comparison", "paired-policy-effects",
                 "journey-time-components", "published-time-distance", "holding-queue-length"):
        assert (Path("figures") / (name + ".png")).read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
print("PASS: fresh notebook execution regenerated the checked-in numeric exports and all six figures.")
