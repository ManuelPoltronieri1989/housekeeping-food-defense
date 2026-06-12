#!/usr/bin/env python3
"""
Backend Authentication API Tests
Tests all authentication endpoints for the Housekeeping & Food Defense API
"""

import requests
import json
from typing import Dict, Any

# Backend URL from frontend/.env
BASE_URL = "https://cleaning-connect-10.preview.emergentagent.com/api"

# Test data
OWNER_EMAIL = "poltronieri.manuel@gmail.com"
OWNER_PASSWORD = "Test1234"
OWNER_NAME = "Manuel Poltronieri"

OPERATOR_EMAIL = "operatore1@test.com"
OPERATOR_PASSWORD = "Pass1234"
OPERATOR_NAME = "Operatore Uno"

# Store tokens for later tests
owner_token = None
operator_token = None


def print_test_header(test_num: int, description: str):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST {test_num}: {description}")
    print(f"{'='*80}")


def print_result(success: bool, expected: str, actual: Any):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}")
    print(f"Expected: {expected}")
    print(f"Actual: {actual}")


def test_1_register_owner():
    """Test 1: Register owner account"""
    print_test_header(1, "POST /api/auth/register - Register Owner")
    
    url = f"{BASE_URL}/auth/register"
    payload = {
        "email": OWNER_EMAIL,
        "password": OWNER_PASSWORD,
        "name": OWNER_NAME
    }
    
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                if user.get("role") == "owner":
                    global owner_token
                    owner_token = data["token"]
                    print_result(True, "200 with token and role='owner'", f"Got token and role='{user.get('role')}'")
                    return True
                else:
                    print_result(False, "role='owner'", f"role='{user.get('role')}'")
                    return False
            else:
                print_result(False, "Response with token and user", "Missing token or user in response")
                return False
        else:
            print_result(False, "Status 200", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def test_2_register_operator():
    """Test 2: Register operator account"""
    print_test_header(2, "POST /api/auth/register - Register Operator")
    
    url = f"{BASE_URL}/auth/register"
    payload = {
        "email": OPERATOR_EMAIL,
        "password": OPERATOR_PASSWORD,
        "name": OPERATOR_NAME
    }
    
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                if user.get("role") == "operator":
                    global operator_token
                    operator_token = data["token"]
                    print_result(True, "200 with token and role='operator'", f"Got token and role='{user.get('role')}'")
                    return True
                else:
                    print_result(False, "role='operator'", f"role='{user.get('role')}'")
                    return False
            else:
                print_result(False, "Response with token and user", "Missing token or user in response")
                return False
        else:
            print_result(False, "Status 200", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def test_3_register_duplicate_owner():
    """Test 3: Try to register duplicate owner email"""
    print_test_header(3, "POST /api/auth/register - Duplicate Owner Email (should fail)")
    
    url = f"{BASE_URL}/auth/register"
    payload = {
        "email": OWNER_EMAIL,
        "password": "AnotherPassword123",
        "name": "Another Name"
    }
    
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 400:
            data = response.json()
            detail = data.get("detail", "")
            if "già registrata" in detail.lower() or "already" in detail.lower():
                print_result(True, "400 with 'Email già registrata'", f"Got 400 with detail: '{detail}'")
                return True
            else:
                print_result(False, "Detail contains 'già registrata'", f"Detail: '{detail}'")
                return False
        else:
            print_result(False, "Status 400", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def test_4_login_owner():
    """Test 4: Login with owner credentials"""
    print_test_header(4, "POST /api/auth/login - Login as Owner")
    
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": OWNER_EMAIL,
        "password": OWNER_PASSWORD
    }
    
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                if user.get("role") == "owner":
                    global owner_token
                    owner_token = data["token"]  # Update token
                    print_result(True, "200 with role='owner'", f"Got token and role='{user.get('role')}'")
                    return True
                else:
                    print_result(False, "role='owner'", f"role='{user.get('role')}'")
                    return False
            else:
                print_result(False, "Response with token and user", "Missing token or user in response")
                return False
        else:
            print_result(False, "Status 200", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def test_5_login_wrong_password():
    """Test 5: Login with wrong password"""
    print_test_header(5, "POST /api/auth/login - Wrong Password (should fail)")
    
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": OWNER_EMAIL,
        "password": "WrongPassword999"
    }
    
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 401:
            print_result(True, "401 Unauthorized", f"Got 401")
            return True
        else:
            print_result(False, "Status 401", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def test_6_get_me_with_token():
    """Test 6: GET /api/auth/me with valid Bearer token"""
    print_test_header(6, "GET /api/auth/me - With Valid Token")
    
    if not owner_token:
        print("❌ FAIL - No owner token available from previous tests")
        return False
    
    url = f"{BASE_URL}/auth/me"
    headers = {
        "Authorization": f"Bearer {owner_token}"
    }
    
    print(f"URL: {url}")
    print(f"Headers: Authorization: Bearer {owner_token[:20]}...")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("role") == "owner" and data.get("email") == OWNER_EMAIL.lower():
                print_result(True, "200 with user info including role='owner'", f"Got user with role='{data.get('role')}'")
                return True
            else:
                print_result(False, "User with role='owner'", f"Got role='{data.get('role')}'")
                return False
        else:
            print_result(False, "Status 200", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def test_7_get_me_without_token():
    """Test 7: GET /api/auth/me without Authorization header"""
    print_test_header(7, "GET /api/auth/me - Without Token (should fail)")
    
    url = f"{BASE_URL}/auth/me"
    
    print(f"URL: {url}")
    print("Headers: (no Authorization header)")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 401:
            print_result(True, "401 Unauthorized", f"Got 401")
            return True
        else:
            print_result(False, "Status 401", f"Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Exception: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("BACKEND AUTHENTICATION API TESTS")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("Test 1: Register Owner", test_1_register_owner()))
    results.append(("Test 2: Register Operator", test_2_register_operator()))
    results.append(("Test 3: Duplicate Registration", test_3_register_duplicate_owner()))
    results.append(("Test 4: Login Owner", test_4_login_owner()))
    results.append(("Test 5: Login Wrong Password", test_5_login_wrong_password()))
    results.append(("Test 6: GET /me with Token", test_6_get_me_with_token()))
    results.append(("Test 7: GET /me without Token", test_7_get_me_without_token()))
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*80)
    
    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
