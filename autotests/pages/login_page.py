from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class LoginPage:
    LOGIN = (By.ID, "login")
    PASSWORD = (By.ID, "password")
    SUBMIT = (By.CSS_SELECTOR, "#log button[type=submit]")
    NOTE = (By.ID, "log-note")
    FIELD_ERRORS = (By.CSS_SELECTOR, "#log .err")

    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(self.base_url + "/login")
        self.wait.until(EC.visibility_of_element_located(self.LOGIN))
        return self

    def sign_in(self, login, password):
        self.driver.find_element(*self.LOGIN).clear()
        self.driver.find_element(*self.LOGIN).send_keys(login)
        self.driver.find_element(*self.PASSWORD).clear()
        self.driver.find_element(*self.PASSWORD).send_keys(password)
        self.driver.find_element(*self.SUBMIT).click()

    def wait_for_url(self, part):
        self.wait.until(EC.url_contains(part))
        return self.driver.current_url

    def error_note(self):
        return self.wait.until(EC.visibility_of_element_located(self.NOTE)).text

    def field_errors(self):
        self.wait.until(lambda d: any(e.text for e in d.find_elements(*self.FIELD_ERRORS)))
        return [e.text for e in self.driver.find_elements(*self.FIELD_ERRORS) if e.text]
