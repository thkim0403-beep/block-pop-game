from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 800, "height": 900})

    file_path = os.path.abspath("dist/tistory.html")
    page.goto(f"file:///{file_path}")
    page.wait_for_timeout(3000)
    page.screenshot(path="screenshot-tistory.png", full_page=True)

    browser.close()
