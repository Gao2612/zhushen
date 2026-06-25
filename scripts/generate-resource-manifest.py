from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from json import dumps
from pathlib import Path
from typing import Any

from PIL import Image, ImageSequence


@dataclass(frozen=True)
class AssetRecord:
    path: str
    kind: str
    size: int
    sha256: str
    width: int | None
    height: int | None
    thumbnail: str | None


ROOT: Path = Path(__file__).resolve().parents[1]
ASSETS_ROOT: Path = ROOT / "manual-build" / "assets"
CONTENT_ROOT: Path = ROOT / "content"
THUMB_ROOT: Path = ASSETS_ROOT / "thumbs"
REPORT_ROOT: Path = ROOT / "releases" / "resource-reports"
IMAGE_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
VIDEO_EXTENSIONS: set[str] = {".mp4", ".webm"}
AUDIO_EXTENSIONS: set[str] = {".ogg", ".oga", ".mp3", ".m4a", ".wav"}
SCAN_DIRS: list[str] = [
    "official-posts",
    "玩家-二创图",
    "官方-角色",
    "官方-概念",
    "群友笑话合集",
    "zy",
]


def to_posix(path: Path) -> str:
    return path.as_posix()


def hash_file(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as source:
        while True:
            chunk = source.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def classify(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in IMAGE_EXTENSIONS:
        return "image"
    if suffix in VIDEO_EXTENSIONS:
        return "video"
    if suffix in AUDIO_EXTENSIONS:
        return "audio"
    return "other"


def thumbnail_path(relative_path: Path) -> Path:
    return THUMB_ROOT / relative_path.with_suffix(".webp")


def save_thumbnail(source_path: Path, relative_path: Path) -> tuple[str, int, int]:
    target_path = thumbnail_path(relative_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source_path) as image:
      frame = next(ImageSequence.Iterator(image)).convert("RGBA")
      frame.thumbnail((520, 390), Image.Resampling.LANCZOS)
      background = Image.new("RGBA", frame.size, (18, 18, 24, 255))
      background.alpha_composite(frame)
      background.convert("RGB").save(target_path, "WEBP", quality=76, method=6)
      return to_posix(target_path.relative_to(ASSETS_ROOT)), frame.width, frame.height


def probe_image(path: Path) -> tuple[int | None, int | None]:
    with Image.open(path) as image:
        return image.width, image.height


def should_scan(path: Path) -> bool:
    if not path.is_file():
        return False
    if "thumbs" in path.relative_to(ASSETS_ROOT).parts:
        return False
    suffix = path.suffix.lower()
    return suffix in IMAGE_EXTENSIONS or suffix in VIDEO_EXTENSIONS or suffix in AUDIO_EXTENSIONS


def scan_assets() -> list[AssetRecord]:
    records: list[AssetRecord] = []
    for directory_name in SCAN_DIRS:
        directory_path = ASSETS_ROOT / directory_name
        if not directory_path.exists():
            continue
        for asset_path in directory_path.rglob("*"):
            if not should_scan(asset_path):
                continue
            relative_path = asset_path.relative_to(ASSETS_ROOT)
            kind = classify(asset_path)
            width: int | None = None
            height: int | None = None
            thumb: str | None = None
            if kind == "image":
                width, height = probe_image(asset_path)
                thumb, width, height = save_thumbnail(asset_path, relative_path)
            records.append(
                AssetRecord(
                    path=to_posix(relative_path),
                    kind=kind,
                    size=asset_path.stat().st_size,
                    sha256=hash_file(asset_path),
                    width=width,
                    height=height,
                    thumbnail=thumb,
                )
            )
    return records


def record_to_json(record: AssetRecord) -> dict[str, Any]:
    result: dict[str, Any] = {
        "kind": record.kind,
        "size": record.size,
        "sha256": record.sha256,
    }
    if record.width is not None and record.height is not None:
        result["width"] = record.width
        result["height"] = record.height
    if record.thumbnail is not None:
        result["thumbnail"] = record.thumbnail
    return result


def write_outputs(records: list[AssetRecord]) -> None:
    CONTENT_ROOT.mkdir(parents=True, exist_ok=True)
    REPORT_ROOT.mkdir(parents=True, exist_ok=True)
    assets = {record.path: record_to_json(record) for record in records}
    manifest = {
        "generatedAt": "2026-06-25",
        "thumbnailPolicy": {
            "format": "webp",
            "maxWidth": 520,
            "maxHeight": 390,
            "quality": 76,
        },
        "assets": assets,
    }
    report = {
        "generatedAt": manifest["generatedAt"],
        "totalBytes": sum(record.size for record in records),
        "largest": [
            {
                "path": record.path,
                "kind": record.kind,
                "size": record.size,
                "sizeMB": round(record.size / 1024 / 1024, 2),
            }
            for record in sorted(records, key=lambda item: item.size, reverse=True)[:80]
        ],
    }
    (CONTENT_ROOT / "resource-manifest.json").write_text(
        dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (REPORT_ROOT / "resource-report-2026-06-25.json").write_text(
        dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    records = scan_assets()
    write_outputs(records)
    print(f"资源清单已生成：{len(records)} 个资源")


if __name__ == "__main__":
    main()
