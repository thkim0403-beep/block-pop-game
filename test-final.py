from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Start screen
    page = browser.new_page(viewport={"width": 500, "height": 800})
    page.goto("http://localhost:5193")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.screenshot(path="final-start.png", full_page=True)

    # Free mode - normal difficulty
    page.get_by_text("보통").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="final-game.png")

    page.close()
    browser.close()
    print("Final screenshots saved!")
