from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Mobile viewport (375x667)
    mobile_page = browser.new_page(viewport={"width": 375, "height": 667})
    mobile_page.goto("http://localhost:5193")
    mobile_page.wait_for_load_state("networkidle")
    mobile_page.screenshot(path="screenshot-mobile.png", full_page=True)
    mobile_page.close()

    # Desktop viewport (1280x800)
    desktop_page = browser.new_page(viewport={"width": 1280, "height": 800})
    desktop_page.goto("http://localhost:5193")
    desktop_page.wait_for_load_state("networkidle")
    desktop_page.screenshot(path="screenshot-desktop.png", full_page=True)
    desktop_page.close()

    browser.close()
    print("Screenshots saved!")
