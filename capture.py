"""TheTopClass 랜딩페이지 PC 화면 캡처."""
from __future__ import annotations

import contextlib
import socket
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "captures"
OUTPUT = OUT / "desktop-1280-fullpage.png"
VIEWPORT = (1280, 900)


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@contextlib.contextmanager
def serve_site():
    port = _free_port()
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}/index.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def _wait_for_images(page) -> None:
    page.wait_for_load_state("load")
    page.evaluate(
        """() => {
          for (const img of document.images) {
            img.loading = 'eager';
          }
        }"""
    )
    for img in page.locator("img").all():
        img.scroll_into_view_if_needed(timeout=5000)
    page.wait_for_function(
        """() => Array.from(document.images).every((img) => img.complete)"""
    )


def capture() -> None:
    OUT.mkdir(exist_ok=True)

    with serve_site() as url, sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(
            viewport={"width": VIEWPORT[0], "height": VIEWPORT[1]},
            device_scale_factor=1,
        )
        page.goto(url, wait_until="load", timeout=60000)
        _wait_for_images(page)
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(OUTPUT), full_page=True, timeout=120000)
        browser.close()

    print(f"저장 완료: {OUTPUT}")


if __name__ == "__main__":
    capture()
