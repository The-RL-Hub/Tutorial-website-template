"""Static integrity checks for the reusable tutorial template."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        for name, value in attrs:
            if value and name in {"href", "src"}:
                self.references.append(value)


def check_text_encoding() -> None:
    markers = tuple(
        chr(codepoint)
        for codepoint in (0xFFFD, 0xC3, 0xC2, 0xD8, 0xD9)
    )
    markers += (chr(0xE2) + chr(0x20AC),)
    suffixes = {".html", ".md", ".css", ".js", ".py"}
    failures: list[str] = []

    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in suffixes:
            continue
        text = path.read_text(encoding="utf-8")
        found = [marker for marker in markers if marker in text]
        if found:
            failures.append(f"{path.relative_to(ROOT)}: {found}")

    assert not failures, "Possible text encoding corruption:\n" + "\n".join(
        failures
    )


def main() -> None:
    missing: list[str] = []
    for page in ROOT.glob("*.html"):
        parser = ReferenceParser()
        parser.feed(page.read_text(encoding="utf-8"))
        for reference in parser.references:
            parsed = urlsplit(reference)
            if parsed.scheme or parsed.netloc or reference.startswith(("#", "mailto:")):
                continue
            path_part = unquote(parsed.path)
            if not path_part:
                continue
            target = (page.parent / path_part).resolve()
            try:
                target.relative_to(ROOT.resolve())
            except ValueError as exc:
                raise AssertionError(f"Path escapes template root: {reference}") from exc
            if not target.exists():
                missing.append(f"{page.name} -> {reference}")

    assert not missing, "Missing local references:\n" + "\n".join(missing)
    lesson_path = ROOT / "content/tutorials/example/lesson.md"
    assert lesson_path.exists()
    lesson = lesson_path.read_text(encoding="utf-8")
    for heading in (
        "## Learning goals and prerequisites",
        "## Worked audit",
        "## Assumptions and common mistakes",
        "## Summary",
        "## Exercises",
        "## Primary sources",
    ):
        assert heading in lesson, f"Example lesson omits {heading}"

    tutorial = (ROOT / "tutorial.html").read_text(encoding="utf-8")
    assert "marked@15.0.12/marked.min.js" in tutorial
    assert "mathjax@3.2.2/es5/tex-mml-chtml.js" in tutorial
    assert "normalizedPath.startsWith('content/tutorials/')" in tutorial
    assert "!pathParts.includes('..')" in tutorial

    usage = (ROOT / "docs/USAGE.md").read_text(encoding="utf-8")
    assert "## Lesson verification" in usage
    assert "termination" in usage and "truncation" in usage
    assert "encoding check" in usage

    check_text_encoding()
    print("PASS template integrity checks")


if __name__ == "__main__":
    main()
