"""
Connect to Supabase API server to fetch banner plans and questions
"""

import requests
import json

API_BASE_URL = "http://localhost:5174/api"

def get_banner_plans_for_project(project_id):
    """
    Fetch banner plans from Supabase via API server

    Args:
        project_id: Project UUID

    Returns:
        list: Banner plans
    """
    try:
        response = requests.get(f"{API_BASE_URL}/projects/{project_id}/banners")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching banner plans: {e}")
        return []


def get_questions_for_project(project_id):
    """
    Fetch questions from Supabase via API server

    Args:
        project_id: Project UUID

    Returns:
        list: Questions with auto-detected types
    """
    try:
        response = requests.get(f"{API_BASE_URL}/projects/{project_id}/questions")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return []


def check_api_health():
    """Check if API server is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False