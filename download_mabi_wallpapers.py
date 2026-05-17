#!/usr/bin/env python3
import html
import os
import re
import time
import zipfile
from pathlib import Path
from urllib.parse import quote, urlparse, urlsplit, urlunsplit
from urllib.request import Request, urlopen


PAGE_URL = "https://mabinogi.nexon.com/page/pds/gallery_wallpaper.asp"
DOWNLOAD_DIR = Path("mabinogi_wallpapers_4k")
ZIP_PATH = Path("mabinogi_wallpapers_4k.zip")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Referer": PAGE_URL,
}


def fetch(url, timeout=60):
    url = iri_to_uri(url)
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=timeout) as response:
        return response.read(), response.headers


def iri_to_uri(url):
    parts = urlsplit(url)
    path = quote(parts.path, safe="/%")
    query = quote(parts.query, safe="=&?/%")
    return urlunsplit((parts.scheme, parts.netloc, path, query, parts.fragment))


def decode_page(data, headers):
    content_type = headers.get("content-type", "")
    match = re.search(r"charset=([\w-]+)", content_type, re.I)
    encodings = [match.group(1)] if match else []
    encodings += ["euc-kr", "cp949", "utf-8"]

    for encoding in encodings:
        try:
            return data.decode(encoding)
        except (LookupError, UnicodeDecodeError):
            pass
    return data.decode("utf-8", errors="replace")


def sanitize(name):
    name = html.unescape(name).strip()
    name = re.sub(r'[\\/:*?"<>|]', "_", name)
    name = re.sub(r"\s+", " ", name)
    return name[:120] or "wallpaper"


def image_size(data):
    if data.startswith(b"\xff\xd8"):
        i = 2
        while i < len(data) - 9:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            i += 2
            if marker in (0xD8, 0xD9):
                continue
            if i + 2 > len(data):
                break
            length = int.from_bytes(data[i : i + 2], "big")
            is_start_of_frame = (
                marker in range(0xC0, 0xC4)
                or marker in range(0xC5, 0xC8)
                or marker in range(0xC9, 0xCC)
                or marker in range(0xCD, 0xD0)
            )
            if is_start_of_frame:
                if i + 7 <= len(data):
                    height = int.from_bytes(data[i + 3 : i + 5], "big")
                    width = int.from_bytes(data[i + 5 : i + 7], "big")
                    return width, height
            i += max(length, 2)

    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        width = int.from_bytes(data[16:20], "big")
        height = int.from_bytes(data[20:24], "big")
        return width, height

    return None


def extract_wallpapers(page_html):
    wallpapers = []
    seen = set()

    item_pattern = r"<li(?:\s+class=\"last\")?>\s*<p class=\"thum active\">.*?</li>"
    for block in re.findall(item_pattern, page_html, re.S | re.I):
        alt_pattern = r"<p class=\"thum active\"><img[^>]+alt=\"([^\"]*)\""
        alt_match = re.search(alt_pattern, block, re.S | re.I)
        title = sanitize(alt_match.group(1) if alt_match else "wallpaper")

        for raw_url in re.findall(r"viewWall2\('([^']*3840\s*[xX]\s*2160[^']*)'", block, re.I):
            url = html.unescape(raw_url).strip()
            if url in seen:
                continue
            seen.add(url)
            wallpapers.append((title, url))

    if wallpapers:
        return wallpapers

    for raw_url in re.findall(r"viewWall2\('([^']*3840\s*[xX]\s*2160[^']*)'", page_html, re.I):
        url = html.unescape(raw_url).strip()
        if url not in seen:
            seen.add(url)
            wallpapers.append(("wallpaper", url))
    return wallpapers


def unique_path(title, url, index):
    parsed = urlparse(url)
    ext = os.path.splitext(parsed.path)[1] or ".jpg"
    base = sanitize(f"{index:03d}_{title}")
    return DOWNLOAD_DIR / f"{base}{ext}"


def main():
    DOWNLOAD_DIR.mkdir(exist_ok=True)

    print(f"공식 월페이퍼 페이지 읽는 중: {PAGE_URL}")
    data, headers = fetch(PAGE_URL, timeout=30)
    page_html = decode_page(data, headers)
    wallpapers = extract_wallpapers(page_html)
    print(f"4K 후보 {len(wallpapers)}개 발견")

    downloaded = []
    skipped = 0

    for index, (title, url) in enumerate(wallpapers, start=1):
        path = unique_path(title, url, index)
        print(f"[{index}/{len(wallpapers)}] {title}")
        print(f"  -> {url}")

        try:
            if path.exists():
                downloaded.append(path)
                print(f"  -> 이미 존재: {path.name}")
                continue

            image_data, _ = fetch(url, timeout=90)
            size = image_size(image_data)
            if size and size != (3840, 2160):
                print(f"  -> 건너뜀: 실제 해상도 {size[0]}x{size[1]}")
                skipped += 1
                continue

            path.write_bytes(image_data)
            downloaded.append(path)
            print(f"  -> 저장 완료: {path.name}")
            time.sleep(0.25)
        except Exception as exc:
            print(f"  -> 실패: {exc}")
            skipped += 1

    if downloaded:
        with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for path in downloaded:
                zf.write(path, arcname=f"{DOWNLOAD_DIR.name}/{path.name}")

    print()
    print(f"다운로드 완료: {len(downloaded)}개")
    print(f"건너뜀/실패: {skipped}개")
    if downloaded:
        print(f"ZIP 생성 완료: {ZIP_PATH}")


if __name__ == "__main__":
    main()
