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
    for name in ("paired-replications.csv", "policy-effects.csv", "monte-carlo-scaling.csv",
                 "disturbance-propagation.csv", "default-cap-mechanism.csv"):
        relative = Path("data") / name
        with (root / relative).open(newline="") as expected, relative.open(newline="") as observed:
            compare(list(csv.DictReader(expected)), list(csv.DictReader(observed)))
    with Path("data/paired-replications.csv").open(newline="") as file:
        records = list(csv.DictReader(file))
    assert len(records) == 720
    blocks = {}
    for record in records:
        key = record["demand"], record["road_cv"], record["replication"]
        blocks.setdefault(key, []).append(record)
        compare(float(record["platform_wait"]) + float(record["onboard_time"]), record["journey_time"])
        assert 0 <= float(record["bus2_hold"]) <= int(record["cap"])
    assert len(blocks) == 180
    for block in blocks.values():
        assert sorted(int(row["cap"]) for row in block) == [0, 20, 40, 60]
        assert len({(r["demand_seed"], r["road_seed"], r["completed"]) for r in block}) == 1
    assert Path("docs/reference.js").read_bytes() == (root / "docs/reference.js").read_bytes()
    relative = Path("data/browser-reference.json")
    compare(json.loads((root / relative).read_text()), json.loads(relative.read_text()))
    for name in ("paired-policy-effects", "hold-cap-response", "monte-carlo-error-scaling", "analytical-verification"):
        assert (Path("figures") / (name + ".png")).read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
print("PASS: fresh notebook execution regenerated the numeric exports and all four scientific figures.")
