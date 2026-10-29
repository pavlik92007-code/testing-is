import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SHOTS = os.path.join(os.path.dirname(__file__), "failed")


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture
def driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1280,900")
    d = webdriver.Chrome(options=opts)
    yield d
    d.quit()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if rep.when == "call" and rep.failed and "driver" in item.funcargs:
        os.makedirs(SHOTS, exist_ok=True)
        item.funcargs["driver"].save_screenshot(os.path.join(SHOTS, item.name + ".png"))
