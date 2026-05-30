# Social Media API - Complete Implementation Guide

**Status**: ✅ Production Ready  
**Date**: May 28, 2026  
**Last Updated**: Latest Version

## Overview

The Social Media API provides complete functionality for managing social media accounts, scheduling posts, publishing content, and tracking analytics across Twitter, LinkedIn, Facebook, and Instagram.

## Base URL

```
http://localhost:8000/v1/social
```

## Authentication

All endpoints require:
- **Authorization Header**: `Bearer {access_token}`
- **Method**: JWT Bearer Token

## Endpoints Summary

### Account Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts` | Connect a social media account |
| GET | `/accounts` | List all connected accounts |
| GET | `/accounts/{account_id}` | Get account details |
| DELETE | `/accounts/{account_id}` | Disconnect account |

### Post Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts` | Create new post (draft/scheduled) |
| GET | `/posts` | List posts with filters |
| GET | `/posts/{post_id}` | Get post details |
| PATCH | `/posts/{post_id}` | Update post |
| DELETE | `/posts/{post_id}` | Delete post |
| POST | `/posts/{post_id}/publish` | Publish immediately |
| POST | `/posts/bulk/publish` | Publish multiple posts |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Aggregated analytics |
| GET | `/analytics/platform/{platform}` | Platform-specific analytics |
| GET | `/posts/scheduled` | Get upcoming scheduled posts |

---

## Detailed Endpoint Documentation

### 1. Connect Social Account

**Endpoint**: `POST /accounts`

**Description**: Connect a social media account by providing platform credentials.

**Request Body**:
```json
{
  "platform": "twitter",
  "access_token": "sk_live_...",
  "refresh_token": "refresh_...",
  "account_id": "123456"
}
```

**Supported Platforms**:
- `twitter` - Twitter/X
- `linkedin` - LinkedIn
- `facebook` - Facebook
- `instagram` - Instagram

**Response** (201 Created):
```json
{
  "id": "uuid",
  "platform": "twitter",
  "account_id": "123456",
  "account_name": "MyBrand",
  "profile_url": "https://twitter.com/mybrand",
  "avatar_url": "https://...",
  "follower_count": 5000,
  "is_active": true,
  "last_synced_at": "2026-05-28T10:30:00Z",
  "created_at": "2026-05-28T10:00:00Z",
  "updated_at": "2026-05-28T10:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid credentials
- `409 Conflict` - Account already connected

---

### 2. List Connected Accounts

**Endpoint**: `GET /accounts`

**Query Parameters**:
```
platform?=twitter    # Filter by platform (optional)
is_active?=true      # Filter by active status (optional)
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "platform": "twitter",
      "account_name": "MyBrand",
      "follower_count": 5000,
      "is_active": true,
      ...
    }
  ],
  "total": 1
}
```

---

### 3. Create Social Post

**Endpoint**: `POST /posts`

**Request Body**:
```json
{
  "account_id": "uuid",
  "post_text": "Check out our new AI marketing platform! 🚀",
  "media_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "hashtags": ["AI", "Marketing", "Automation"],
  "content_id": "uuid-of-content-item",
  "scheduled_at": "2026-05-30T14:30:00Z"
}
```

**Field Constraints**:
- `post_text`: Required, 1-5000 chars (Twitter max 280)
- `media_urls`: Optional, max 10, must be valid URLs
- `hashtags`: Optional, max 30
- `scheduled_at`: Optional, must be future datetime

**Response** (201 Created):
```json
{
  "id": "uuid",
  "account_id": "uuid",
  "platform": "twitter",
  "post_text": "Check out our new AI marketing platform! 🚀",
  "media_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "hashtags": ["AI", "Marketing", "Automation"],
  "status": "scheduled",
  "external_post_id": null,
  "post_url": null,
  "scheduled_at": "2026-05-30T14:30:00Z",
  "published_at": null,
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "impressions": 0,
  "reach": 0,
  "engagement_rate": null,
  "error_message": null,
  "created_at": "2026-05-28T10:00:00Z",
  "updated_at": "2026-05-28T10:00:00Z"
}
```

**Status Values**:
- `draft` - Created but not scheduled
- `scheduled` - Scheduled for future publishing
- `published` - Successfully published
- `failed` - Publishing failed (check error_message)
- `archived` - Archived/deleted

---

### 4. List Social Posts

**Endpoint**: `GET /posts`

**Query Parameters**:
```
page=1                   # Page number (1-based)
limit=20                 # Items per page (1-100)
platform?=twitter        # Filter by platform
status?=published        # Filter by status
account_id?=uuid         # Filter by account
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "platform": "twitter",
      "post_text": "...",
      "status": "published",
      ...
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

### 5. Get Post Details

**Endpoint**: `GET /posts/{post_id}`

**Response** (200 OK):
```json
{
  "id": "uuid",
  "account_id": "uuid",
  "platform": "twitter",
  "post_text": "Check out our new AI marketing platform! 🚀",
  "media_urls": ["https://..."],
  "hashtags": ["AI", "Marketing"],
  "status": "published",
  "external_post_id": "1234567890",
  "post_url": "https://twitter.com/i/web/status/1234567890",
  "likes": 245,
  "comments": 18,
  "shares": 52,
  "impressions": 8500,
  "reach": 4200,
  "engagement_rate": "3.1",
  "published_at": "2026-05-28T14:30:00Z",
  ...
}
```

---

### 6. Update Post

**Endpoint**: `PATCH /posts/{post_id}`

**Request Body** (all fields optional):
```json
{
  "post_text": "Updated text",
  "media_urls": ["https://..."],
  "hashtags": ["NewTag"],
  "scheduled_at": "2026-05-31T10:00:00Z",
  "status": "scheduled"
}
```

**Restrictions**:
- Cannot update published posts
- Can only update draft or scheduled posts

**Response** (200 OK): Updated post object

---

### 7. Delete Post

**Endpoint**: `DELETE /posts/{post_id}`

**Restrictions**:
- Cannot delete published posts
- Only draft/scheduled posts can be deleted

**Response** (204 No Content)

---

### 8. Publish Immediately

**Endpoint**: `POST /posts/{post_id}/publish`

**Description**: Publish a draft or scheduled post immediately.

**Response** (200 OK):
```json
{
  "id": "uuid",
  "status": "published",
  "published_at": "2026-05-28T14:30:00Z",
  "external_post_id": "1234567890",
  "post_url": "https://twitter.com/i/web/status/1234567890",
  ...
}
```

---

### 9. Bulk Publish

**Endpoint**: `POST /posts/bulk/publish`

**Request Body**:
```json
{
  "post_ids": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}
```

**Response** (200 OK):
```json
{
  "published": 3,
  "failed": 0,
  "results": {
    "uuid-1": {"status": "queued"},
    "uuid-2": {"status": "queued"},
    "uuid-3": {"status": "queued"}
  }
}
```

---

### 10. Get Aggregated Analytics

**Endpoint**: `GET /analytics`

**Query Parameters**:
```
days=30    # Number of days to include (1-365)
```

**Response** (200 OK):
```json
{
  "total_posts": 42,
  "published_posts": 38,
  "scheduled_posts": 3,
  "failed_posts": 1,
  "total_engagement": 1520,
  "total_impressions": 45000,
  "total_reach": 28500,
  "avg_engagement_rate": 3.4,
  "platforms": {
    "twitter": {
      "platform": "twitter",
      "total_posts": 30,
      "published_posts": 28,
      "scheduled_posts": 2,
      "failed_posts": 0,
      "total_engagement": 890,
      "total_impressions": 28000,
      "total_reach": 15000,
      "avg_engagement_rate": 3.2,
      "top_post": {
        "post_id": "uuid",
        "platform": "twitter",
        "likes": 120,
        "comments": 15,
        "shares": 45,
        "impressions": 5000,
        "reach": 2800,
        "engagement_rate": 3.2,
        "last_updated": "2026-05-28T10:00:00Z"
      },
      "last_synced": "2026-05-28T12:00:00Z"
    },
    "linkedin": {
      "platform": "linkedin",
      "total_posts": 12,
      "published_posts": 10,
      "scheduled_posts": 1,
      "failed_posts": 1,
      "total_engagement": 630,
      "total_impressions": 17000,
      "total_reach": 13500,
      "avg_engagement_rate": 3.7,
      ...
    }
  },
  "date_range_start": "2026-04-28T00:00:00Z",
  "date_range_end": "2026-05-28T23:59:59Z",
  "last_synced": "2026-05-28T12:00:00Z"
}
```

---

### 11. Get Platform Analytics

**Endpoint**: `GET /analytics/platform/{platform}`

**Query Parameters**:
```
days=30    # Number of days to include
```

**Response** (200 OK):
```json
{
  "platform": "twitter",
  "total_posts": 30,
  "published_posts": 28,
  "scheduled_posts": 2,
  "failed_posts": 0,
  "total_engagement": 890,
  "total_impressions": 28000,
  "total_reach": 15000,
  "avg_engagement_rate": 3.2,
  "top_post": {
    "post_id": "uuid",
    "platform": "twitter",
    "likes": 120,
    "comments": 15,
    "shares": 45,
    "impressions": 5000,
    "reach": 2800,
    "engagement_rate": 3.2,
    "last_updated": "2026-05-28T10:00:00Z"
  },
  "last_synced": "2026-05-28T12:00:00Z"
}
```

---

### 12. Get Scheduled Posts

**Endpoint**: `GET /posts/scheduled`

**Response** (200 OK):
```json
{
  "posts": [
    {
      "id": "uuid",
      "status": "scheduled",
      "scheduled_at": "2026-05-30T14:30:00Z",
      ...
    }
  ],
  "total": 5,
  "next_publish_in_minutes": 2880
}
```

---

## Celery Tasks

The Social Media API uses Celery for asynchronous operations:

### Task: `publish_social_post`
- **Queue**: `default`
- **Retries**: 3 with exponential backoff
- **Timeout**: 1 hour
- **Triggers**: When post status changes to `published`
- **Updates**: Sets `external_post_id`, `post_url`, and engagement metrics

### Task: `sync_social_metrics`
- **Queue**: `default`
- **Triggers**: 
  - When account is first connected
  - Manually via `/sync` endpoint (future)
- **Updates**: Fetches latest engagement metrics from platform

### Task: `sync_all_social_metrics`
- **Queue**: `default`
- **Schedule**: Every 60 minutes (via Beat)
- **Runs**: Syncs metrics for all active accounts

---

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "detail": "Post text cannot be empty"
}
```

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found**:
```json
{
  "detail": "Social post not found"
}
```

**409 Conflict**:
```json
{
  "detail": "Account already connected for twitter"
}
```

---

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Headers**: 
  - `X-RateLimit-Remaining` - Requests left in window
  - `X-RateLimit-Reset` - Unix timestamp when limit resets

---

## Code Examples

### Python - Using httpx

```python
import httpx
from datetime import datetime, timedelta

async def create_and_schedule_post():
    async with httpx.AsyncClient() as client:
        # Get accounts
        accounts = await client.get(
            "http://localhost:8000/v1/social/accounts",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        account_id = accounts.json()["items"][0]["id"]
        
        # Create scheduled post
        post = await client.post(
            "http://localhost:8000/v1/social/posts",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "account_id": account_id,
                "post_text": "Hello world! 🌍",
                "hashtags": ["hello", "world"],
                "scheduled_at": (datetime.utcnow() + timedelta(hours=1)).isoformat()
            }
        )
        
        return post.json()
```

### JavaScript/TypeScript - Using fetch

```typescript
async function createAndSchedulePost(token: string) {
  // Get accounts
  const accountsRes = await fetch('http://localhost:8000/v1/social/accounts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { items } = await accountsRes.json();
  const accountId = items[0].id;
  
  // Create scheduled post
  const postRes = await fetch('http://localhost:8000/v1/social/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      account_id: accountId,
      post_text: 'Hello world! 🌍',
      hashtags: ['hello', 'world'],
      scheduled_at: new Date(Date.now() + 3600000).toISOString()
    })
  });
  
  return postRes.json();
}
```

### cURL

```bash
# Connect Twitter account
curl -X POST http://localhost:8000/v1/social/accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "access_token": "YOUR_TWITTER_TOKEN",
    "account_id": "12345"
  }'

# Create post
curl -X POST http://localhost:8000/v1/social/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "UUID",
    "post_text": "Hello world! 🌍",
    "hashtags": ["hello", "world"],
    "scheduled_at": "2026-05-30T14:30:00Z"
  }'

# Get analytics
curl -X GET "http://localhost:8000/v1/social/analytics?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Integration with Frontend

### SWR Hooks Example

Create `/lib/hooks/use-social.ts`:

```typescript
import useSWR from 'swr';
import { fetcher } from '@/lib/api-client';

export function useSocialAccounts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/v1/social/accounts',
    fetcher
  );
  
  return {
    accounts: data?.items || [],
    isLoading,
    error,
    mutate
  };
}

export function useSocialPosts(page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/v1/social/posts?page=${page}&limit=${limit}`,
    fetcher
  );
  
  return {
    posts: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate
  };
}
```

---

## Performance Optimization

1. **Pagination**: Always use pagination for list endpoints
2. **Caching**: SWR caches by default, configure as needed
3. **Batch Operations**: Use bulk publish for multiple posts
4. **Async Publishing**: All posts publish via Celery (non-blocking)
5. **Metrics Sync**: Automatic sync every hour, manual via API

---

## Security Considerations

1. **Tokens**: Encrypted in database (in production)
2. **Validation**: All inputs validated with Pydantic
3. **Authorization**: Multi-tenant isolation via org_id
4. **Rate Limiting**: Per-user rate limits
5. **CORS**: Configured for specific origins
6. **HTTPS**: Required in production

---

## Support & Troubleshooting

### Common Issues

**"Social account not found"**
- Verify account_id is correct
- Check account hasn't been deleted
- Ensure you're in correct organization

**"Post already published"**
- Post has already been published
- Cannot republish from history
- Create new post instead

**"Cannot update published posts"**
- Published posts are immutable
- Create new post for changes

**Publishing Fails Silently**
- Check post status (should be "failed" with error_message)
- Verify platform tokens are valid
- Check Celery worker logs: `celery -A app.celery_app inspect active`

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Monitor Celery tasks:
```bash
# Flower dashboard
http://localhost:5555

# Celery logs
docker logs container_name
```

---

## What's Included

✅ Complete Social Media API with 12 endpoints  
✅ Support for Twitter, LinkedIn, Facebook, Instagram  
✅ Post scheduling with Celery  
✅ Real-time analytics tracking  
✅ Error handling and retries  
✅ Bulk operations  
✅ Comprehensive validation  
✅ Production-ready code  
✅ Full documentation  

## Next Steps

1. **Configure API Keys** - Add social platform credentials to `.env`
2. **Test Endpoints** - Use Swagger UI at `/docs`
3. **Set up Celery** - Run `celery -A app.celery_app worker`
4. **Connect Accounts** - Use POST `/accounts` to connect platforms
5. **Create Posts** - Start scheduling content
6. **Monitor Analytics** - Track performance via analytics endpoints
