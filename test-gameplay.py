from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Mobile - click "보통" to start game
    mobile = browser.new_page(viewport={"width": 375, "height": 667})
    mobile.goto("http://localhost:5193")
    mobile.wait_for_load_state("networkidle")
    mobile.get_by_text("보통").click()
    mobile.wait_for_timeout(800)
    mobile.screenshot(path="screenshot-game-mobile.png", full_page=True)
    mobile.close()

    # Desktop
    desktop = browser.new_page(viewport={"width": 1280, "height": 800})
    desktop.goto("http://localhost:5193")
    desktop.wait_for_load_state("networkidle")
    desktop.get_by_text("보통").click()
    desktop.wait_for_timeout(800)
    desktop.screenshot(path="screenshot-game-desktop.png", full_page=True)
    desktop.close()

    browser.close()
    print("Game screenshots saved!")
