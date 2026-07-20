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
    assert (ROOT / "content/tutorials/example/lesson.md").exists()

    tutorial = (ROOT / "tutorial.html").read_text(encoding="utf-8")
    assert "marked@15.0.12/marked.min.js" in tutorial
    assert "mathjax@3.2.2/es5/tex-mml-chtml.js" in tutorial
    assert "normalizedPath.startsWith('content/tutorials/')" in tutorial
    assert "!pathParts.includes('..')" in tutorial
    print("PASS template integrity checks")


if __name__ == "__main__":
    main()
