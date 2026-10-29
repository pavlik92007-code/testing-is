import pytest
from pages.login_page import LoginPage


@pytest.fixture
def page(driver, base_url):
    return LoginPage(driver, base_url).open()


def test_participant_goes_to_cabinet(page):
    page.sign_in("ivan_k", "Ivan2026pass")
    assert page.wait_for_url("/cabinet").endswith("/cabinet")


def test_admin_goes_to_admin_panel(page):
    page.sign_in("admin", "Admin2026!")
    assert page.wait_for_url("/admin").endswith("/admin")


def test_wrong_password_shows_error(page):
    page.sign_in("ivan_k", "wrongpass99")
    assert page.error_note() == "Неверный логин или пароль"
    assert page.driver.current_url.endswith("/login")


def test_unknown_login_shows_same_error(page):
    page.sign_in("nobody_here", "whatever12")
    assert page.error_note() == "Неверный логин или пароль"


def test_empty_fields_show_errors_under_fields(page):
    page.sign_in("", "")
    assert page.field_errors() == ["Введите логин", "Введите пароль"]
