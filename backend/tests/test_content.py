"""
Content API tests.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_content(client: AsyncClient, auth_headers):
    """Test creating content."""
    response = await client.post(
        "/v1/content/",
        headers=auth_headers,
        json={
            "title": "Test Blog Post",
            "content_type": "blog",
            "body": "This is the content body for testing.",
            "meta_description": "Test meta description",
            "keywords": ["test", "blog"],
            "tone": "professional"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Blog Post"
    assert data["content_type"] == "blog"
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_list_content(client: AsyncClient, auth_headers):
    """Test listing content."""
    # First create some content
    await client.post(
        "/v1/content/",
        headers=auth_headers,
        json={
            "title": "Content 1",
            "content_type": "blog",
            "body": "Body 1"
        }
    )
    
    response = await client.get("/v1/content/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_update_content(client: AsyncClient, auth_headers):
    """Test updating content."""
    # Create content
    create_response = await client.post(
        "/v1/content/",
        headers=auth_headers,
        json={
            "title": "Original Title",
            "content_type": "blog",
            "body": "Original body"
        }
    )
    content_id = create_response.json()["id"]
    
    # Update content
    response = await client.patch(
        f"/v1/content/{content_id}",
        headers=auth_headers,
        json={
            "title": "Updated Title",
            "status": "pending_review"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "pending_review"


@pytest.mark.asyncio
async def test_delete_content(client: AsyncClient, auth_headers):
    """Test deleting content."""
    # Create content
    create_response = await client.post(
        "/v1/content/",
        headers=auth_headers,
        json={
            "title": "To Delete",
            "content_type": "blog",
            "body": "Will be deleted"
        }
    )
    content_id = create_response.json()["id"]
    
    # Delete content
    response = await client.delete(
        f"/v1/content/{content_id}",
        headers=auth_headers
    )
    assert response.status_code == 204
    
    # Verify deletion
    get_response = await client.get(
        f"/v1/content/{content_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404
