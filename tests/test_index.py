#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regresi skema: draft.md -> index.json + data/*.json -> yang dibaca web."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_index as bi  # noqa: E402


class TestShortDraft(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.files = sorted(bi.DRAFTS_DIR.glob("*/draft.md"))
        cls.entries = [bi.build_entry(p) for p in cls.files]

    def test_ada_draft(self):
        self.assertTrue(self.files, "tidak ada draft.md di drafts/")

    def test_slug_unik(self):
        slugs = [e["slug"] for e in self.entries]
        self.assertEqual(len(slugs), len(set(slugs)), "slug duplikat")

    def test_metadata_dasar(self):
        for e in self.entries:
            with self.subTest(slug=e["slug"]):
                self.assertTrue(e["has_frontmatter"], "frontmatter tidak terbaca")
                self.assertTrue(e["title"], "title kosong")
                self.assertIn(e["status_raw"], bi.STATUSES)
                self.assertTrue(e["format"], "format kosong (9:16 / 16:9)")

    def test_beat_terisi_dan_berurutan(self):
        for e in self.entries:
            with self.subTest(slug=e["slug"]):
                self.assertGreaterEqual(len(e["beats"]), 1, "tidak ada beat")
                self.assertEqual([b["n"] for b in e["beats"]], list(range(1, len(e["beats"]) + 1)))
                for b in e["beats"]:
                    self.assertTrue(b["text"].strip())
                    self.assertGreater(b["words"], 0)
                self.assertEqual(e["beats_count"], len(e["beats"]))
                self.assertEqual(e["words"], sum(b["words"] for b in e["beats"]))

    def test_camera_heuristik(self):
        self.assertTrue(bi.is_camera("POV ada di atas sirin lalu zooming in"))
        self.assertTrue(bi.is_camera("kamera berputar ke belakang"))
        self.assertFalse(bi.is_camera("sirin lalu memakan snacknya"))
        for e in self.entries:
            with self.subTest(slug=e["slug"]):
                self.assertEqual(e["camera_beats"], sum(1 for b in e["beats"] if b["camera"]))

    def test_checks_lengkap(self):
        ids = {c[0] for c in bi.CHECKS}
        for e in self.entries:
            with self.subTest(slug=e["slug"]):
                self.assertEqual({c["id"] for c in e["checks"]}, ids)
                self.assertEqual(e["ready_total"], len(ids))
                self.assertEqual(e["ready"], sum(1 for c in e["checks"] if c["ok"]))

    def test_split_front_tahan_rusak(self):
        meta, body = bi.split_front("---\ntitle: \"x: y\"\n---\n- a\n")
        self.assertEqual(meta.get("title"), "x: y")
        self.assertIn("- a", body)
        meta2, body2 = bi.split_front("---\ntitle: \"belum ditutup\n")
        self.assertIsNone(meta2, "frontmatter tidak tertutup harus dianggap rusak")

    def test_index_json_konsisten(self):
        idx = json.loads((ROOT / "index.json").read_text(encoding="utf-8"))
        self.assertEqual(idx["count"], len(self.entries))
        self.assertEqual(idx["beats"], sum(e["beats_count"] for e in self.entries))
        self.assertEqual(sum(idx["statuses"].values()), idx["count"])
        light_keys = {"notes", "raw", "body"}
        for e in idx["entries"]:
            with self.subTest(slug=e["slug"]):
                self.assertFalse(light_keys & set(e), "index.json kebawa isi berat")
                self.assertTrue((ROOT / e["data"]).exists(), "data/<slug>.json hilang")
                d = json.loads((ROOT / e["data"]).read_text(encoding="utf-8"))
                self.assertEqual(len(d["beats"]), e["beats_count"])
                self.assertTrue(d["raw"].startswith("---") or d["raw"].strip())

    def test_status_di_index(self):
        idx = json.loads((ROOT / "index.json").read_text(encoding="utf-8"))
        for e in idx["entries"]:
            with self.subTest(slug=e["slug"]):
                self.assertIn(e["status"], bi.STATUSES)


if __name__ == "__main__":
    unittest.main(verbosity=2)
