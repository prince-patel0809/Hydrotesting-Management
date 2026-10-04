from enum import Enum


class TestResult(str, Enum):
    PASS = "Pass"
    FAIL = "Fail"
    PENDING = "Pending"
