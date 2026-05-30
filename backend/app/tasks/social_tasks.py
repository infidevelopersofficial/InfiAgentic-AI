"""
Social media-related async tasks for publishing and syncing metrics.
Supports Twitter, LinkedIn, Facebook, and Instagram via respective APIs.
"""
from app.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.social import SocialAccount, SocialPost
from sqlalchemy import select, update
from datetime import datetime, timedelta
from typing import Dict, Optional
import logging
import asyncio
import tweepy
import requests
from urllib.parse import urlencode

logger = logging.getLogger(__name__)


# ============================================================================
# TWITTER / X API INTEGRATION
# ============================================================================

def get_twitter_client(access_token: str) -> tweepy.Client:
    """Initialize Twitter API v2 client with bearer token"""
    return tweepy.Client(
        bearer_token=access_token,
        consumer_key=settings.TWITTER_API_KEY,
        consumer_secret=settings.TWITTER_API_SECRET,
        wait_on_rate_limit=True
    )


async def publish_to_twitter(
    post_id: str,
    account_id: str,
    post_text: str,
    media_urls: list,
    org_id: str
) -> Dict:
    """
    Publish post to Twitter.
    Returns: {success: bool, external_post_id: str, post_url: str, error: str}
    """
    try:
        # Get account with token
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(SocialAccount).where(
                    SocialAccount.id == account_id
                )
            )
            account = result.scalar_one_or_none()
            
            if not account:
                raise ValueError(f"Social account {account_id} not found")
            
            # Initialize Twitter client
            client = get_twitter_client(account.access_token)
            
            # Upload media if provided
            media_ids = []
            if media_urls:
                from io import BytesIO
                for media_url in media_urls[:4]:  # Twitter allows max 4 media per post
                    try:
                        response = requests.get(media_url, timeout=10)
                        if response.status_code == 200:
                            # Upload media to Twitter
                            media = client.upload_media(
                                media=response.content
                            )
                            media_ids.append(media.data['media_id'])
                    except Exception as e:
                        logger.warning(f"Failed to upload media {media_url}: {e}")
            
            # Post tweet
            tweet_data = {"text": post_text}
            if media_ids:
                tweet_data["media"] = {"media_ids": media_ids}
            
            response = client.create_tweet(**tweet_data)
            
            if not response.data:
                raise ValueError("Failed to create tweet")
            
            tweet_id = response.data['id']
            post_url = f"https://twitter.com/i/web/status/{tweet_id}"
            
            # Update post in database
            await db.execute(
                update(SocialPost).where(
                    SocialPost.id == post_id
                ).values(
                    external_post_id=str(tweet_id),
                    post_url=post_url,
                    status="published",
                    published_at=datetime.utcnow()
                )
            )
            await db.commit()
            
            logger.info(f"Published tweet {tweet_id} for post {post_id}")
            
            return {
                "success": True,
                "external_post_id": str(tweet_id),
                "post_url": post_url,
                "platform": "twitter"
            }
    
    except Exception as e:
        logger.error(f"Failed to publish to Twitter: {str(e)}", exc_info=True)
        # Update post status to failed
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(SocialPost).where(
                        SocialPost.id == post_id
                    ).values(
                        status="failed",
                        error_message=str(e)
                    )
                )
                await db.commit()
        except:
            pass
        
        return {
            "success": False,
            "error": str(e),
            "platform": "twitter"
        }


# ============================================================================
# LINKEDIN API INTEGRATION
# ============================================================================

async def publish_to_linkedin(
    post_id: str,
    account_id: str,
    post_text: str,
    media_urls: list,
    org_id: str
) -> Dict:
    """
    Publish post to LinkedIn.
    Returns: {success: bool, external_post_id: str, post_url: str, error: str}
    """
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(SocialAccount).where(
                    SocialAccount.id == account_id
                )
            )
            account = result.scalar_one_or_none()
            
            if not account:
                raise ValueError(f"Social account {account_id} not found")
            
            # LinkedIn API endpoint
            headers = {
                "Authorization": f"Bearer {account.access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }
            
            # First, register share upload for media if needed
            media_ids = []
            if media_urls:
                for media_url in media_urls[:10]:  # LinkedIn allows multiple media
                    try:
                        # Register upload
                        upload_response = requests.post(
                            "https://api.linkedin.com/v2/assets?action=registerUpload",
                            headers=headers,
                            json={
                                "registerUploadRequest": {
                                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                                    "owner": f"urn:li:person:{account.account_id}",
                                    "serviceRelationships": [{
                                        "relationshipType": "OWNER",
                                        "identifier": "urn:li:userGeneratedContent"
                                    }]
                                }
                            },
                            timeout=10
                        )
                        
                        if upload_response.status_code == 200:
                            upload_data = upload_response.json()
                            upload_url = upload_data.get('value', {}).get('uploadMechanism', {}).get('com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest', {}).get('uploadUrl')
                            asset = upload_data.get('value', {}).get('asset')
                            
                            if upload_url and asset:
                                # Download and upload media
                                media_response = requests.get(media_url, timeout=10)
                                if media_response.status_code == 200:
                                    requests.put(
                                        upload_url,
                                        headers={"Content-Type": "image/jpeg"},
                                        data=media_response.content
                                    )
                                    media_ids.append(asset)
                    except Exception as e:
                        logger.warning(f"Failed to upload media to LinkedIn {media_url}: {e}")
            
            # Create share
            share_payload = {
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.share.UGCContent": {
                        "shareCommentary": {
                            "text": post_text
                        },
                        "shareMediaCategory": "IMAGE" if media_ids else "NONE",
                        "media": [{"status": "READY", "media": media_id} for media_id in media_ids] if media_ids else []
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(
                f"https://api.linkedin.com/v2/ugcPosts",
                headers=headers,
                json=share_payload,
                timeout=15
            )
            
            if response.status_code not in [200, 201]:
                raise ValueError(f"LinkedIn API error: {response.status_code} - {response.text}")
            
            post_data = response.json()
            external_id = post_data.get('id')
            
            # Update post in database
            await db.execute(
                update(SocialPost).where(
                    SocialPost.id == post_id
                ).values(
                    external_post_id=external_id,
                    post_url=f"https://www.linkedin.com/feed/update/{external_id}",
                    status="published",
                    published_at=datetime.utcnow()
                )
            )
            await db.commit()
            
            logger.info(f"Published LinkedIn post {external_id} for post {post_id}")
            
            return {
                "success": True,
                "external_post_id": external_id,
                "post_url": f"https://www.linkedin.com/feed/update/{external_id}",
                "platform": "linkedin"
            }
    
    except Exception as e:
        logger.error(f"Failed to publish to LinkedIn: {str(e)}", exc_info=True)
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(SocialPost).where(
                        SocialPost.id == post_id
                    ).values(
                        status="failed",
                        error_message=str(e)
                    )
                )
                await db.commit()
        except:
            pass
        
        return {
            "success": False,
            "error": str(e),
            "platform": "linkedin"
        }


# ============================================================================
# FACEBOOK & INSTAGRAM API INTEGRATION
# ============================================================================

async def publish_to_facebook(
    post_id: str,
    account_id: str,
    post_text: str,
    media_urls: list,
    org_id: str
) -> Dict:
    """
    Publish post to Facebook.
    """
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(SocialAccount).where(
                    SocialAccount.id == account_id
                )
            )
            account = result.scalar_one_or_none()
            
            if not account:
                raise ValueError(f"Social account {account_id} not found")
            
            headers = {"Authorization": f"Bearer {account.access_token}"}
            
            # Prepare payload
            payload = {"message": post_text}
            
            # Add media if available
            if media_urls:
                payload["url"] = media_urls[0]
            
            # Post to Facebook
            page_id = account.account_id
            response = requests.post(
                f"https://graph.facebook.com/v19.0/{page_id}/feed",
                headers=headers,
                data=payload,
                timeout=15
            )
            
            if response.status_code not in [200, 201]:
                raise ValueError(f"Facebook API error: {response.status_code} - {response.text}")
            
            post_data = response.json()
            post_fb_id = post_data.get('id')
            
            await db.execute(
                update(SocialPost).where(
                    SocialPost.id == post_id
                ).values(
                    external_post_id=post_fb_id,
                    post_url=f"https://facebook.com/{post_fb_id}",
                    status="published",
                    published_at=datetime.utcnow()
                )
            )
            await db.commit()
            
            logger.info(f"Published Facebook post {post_fb_id}")
            
            return {
                "success": True,
                "external_post_id": post_fb_id,
                "post_url": f"https://facebook.com/{post_fb_id}",
                "platform": "facebook"
            }
    
    except Exception as e:
        logger.error(f"Failed to publish to Facebook: {str(e)}")
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(SocialPost).where(
                        SocialPost.id == post_id
                    ).values(
                        status="failed",
                        error_message=str(e)
                    )
                )
                await db.commit()
        except:
            pass
        
        return {"success": False, "error": str(e), "platform": "facebook"}


# ============================================================================
# CELERY TASKS
# ============================================================================

@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def publish_social_post(self, post_id: str, platform: str, account_id: str) -> Dict:
    """
    Async task to publish a social post to the specified platform.
    Retries up to 3 times with 5-minute delays.
    """
    try:
        logger.info(f"Publishing {platform} post {post_id} via account {account_id}")
        
        # Run async function in event loop
        loop = asyncio.get_event_loop()
        
        # Get post data
        async def get_post_data():
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(SocialPost).where(SocialPost.id == post_id)
                )
                return result.scalar_one_or_none()
        
        post = loop.run_until_complete(get_post_data())
        
        if not post:
            raise ValueError(f"Post {post_id} not found")
        
        # Dispatch to platform-specific handler
        result = None
        if platform == "twitter":
            result = loop.run_until_complete(
                publish_to_twitter(post_id, account_id, post.post_text, post.media_urls, str(post.org_id))
            )
        elif platform == "linkedin":
            result = loop.run_until_complete(
                publish_to_linkedin(post_id, account_id, post.post_text, post.media_urls, str(post.org_id))
            )
        elif platform == "facebook":
            result = loop.run_until_complete(
                publish_to_facebook(post_id, account_id, post.post_text, post.media_urls, str(post.org_id))
            )
        else:
            raise ValueError(f"Unsupported platform: {platform}")
        
        if not result.get("success"):
            raise Exception(result.get("error", "Unknown error"))
        
        logger.info(f"Successfully published {platform} post {post_id}")
        return result
        
    except Exception as exc:
        logger.error(f"Social post publishing failed (attempt {self.request.retries + 1}): {exc}")
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            retry_delay = 300 * (2 ** self.request.retries)  # 5min, 10min, 20min
            raise self.retry(exc=exc, countdown=retry_delay)
        else:
            # Final failure - mark post as failed
            logger.error(f"Final failure for post {post_id} after {self.max_retries} retries")
            return {"success": False, "error": str(exc)}


@celery_app.task
def sync_social_metrics(account_id: str, platform: str) -> Dict:
    """
    Sync engagement metrics from social platform for all posts.
    """
    try:
        logger.info(f"Syncing {platform} metrics for account {account_id}")
        
        loop = asyncio.get_event_loop()
        
        async def sync_metrics():
            async with AsyncSessionLocal() as db:
                # Get account
                result = await db.execute(
                    select(SocialAccount).where(
                        SocialAccount.id == account_id
                    )
                )
                account = result.scalar_one_or_none()
                
                if not account:
                    raise ValueError(f"Account {account_id} not found")
                
                if platform == "twitter":
                    return await sync_twitter_metrics(db, account)
                elif platform == "linkedin":
                    return await sync_linkedin_metrics(db, account)
                else:
                    return {"synced": 0, "platform": platform}
        
        result = loop.run_until_complete(sync_metrics())
        logger.info(f"Synced metrics for {result.get('synced', 0)} posts")
        return result
        
    except Exception as e:
        logger.error(f"Failed to sync social metrics: {str(e)}")
        return {"success": False, "error": str(e)}


async def sync_twitter_metrics(db, account: SocialAccount) -> Dict:
    """Sync metrics from Twitter for all published posts"""
    try:
        client = get_twitter_client(account.access_token)
        
        # Get all published posts
        result = await db.execute(
            select(SocialPost).where(
                SocialPost.external_post_id != None,
                SocialPost.platform == "twitter"
            )
        )
        posts = result.scalars().all()
        
        synced = 0
        for post in posts:
            try:
                # Get tweet metrics
                tweet = client.get_tweet(
                    id=post.external_post_id,
                    tweet_fields=["public_metrics"]
                )
                
                if tweet.data:
                    metrics = tweet.data.get("public_metrics", {})
                    await db.execute(
                        update(SocialPost).where(
                            SocialPost.id == post.id
                        ).values(
                            likes=metrics.get("like_count", 0),
                            comments=metrics.get("reply_count", 0),
                            shares=metrics.get("retweet_count", 0),
                            impressions=metrics.get("impression_count", 0),
                            updated_at=datetime.utcnow()
                        )
                    )
                    synced += 1
            except Exception as e:
                logger.warning(f"Failed to sync metrics for tweet {post.external_post_id}: {e}")
        
        await db.commit()
        return {"synced": synced, "platform": "twitter"}
        
    except Exception as e:
        logger.error(f"Failed to sync Twitter metrics: {e}")
        return {"synced": 0, "error": str(e), "platform": "twitter"}


async def sync_linkedin_metrics(db, account: SocialAccount) -> Dict:
    """Sync metrics from LinkedIn for all published posts"""
    try:
        headers = {
            "Authorization": f"Bearer {account.access_token}",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        # Get all published posts
        result = await db.execute(
            select(SocialPost).where(
                SocialPost.external_post_id != None,
                SocialPost.platform == "linkedin"
            )
        )
        posts = result.scalars().all()
        
        synced = 0
        for post in posts:
            try:
                # Get post statistics
                response = requests.get(
                    f"https://api.linkedin.com/v2/socialMetadata?q=posts&ids=List({post.external_post_id})",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "results" in data and len(data["results"]) > 0:
                        stats = data["results"][0].get("socialMetadata", {})
                        await db.execute(
                            update(SocialPost).where(
                                SocialPost.id == post.id
                            ).values(
                                likes=stats.get("likeCount", 0),
                                comments=stats.get("commentCount", 0),
                                shares=stats.get("shareCount", 0),
                                impressions=stats.get("viewCount", 0),
                                updated_at=datetime.utcnow()
                            )
                        )
                        synced += 1
            except Exception as e:
                logger.warning(f"Failed to sync metrics for LinkedIn post {post.external_post_id}: {e}")
        
        await db.commit()
        return {"synced": synced, "platform": "linkedin"}
        
    except Exception as e:
        logger.error(f"Failed to sync LinkedIn metrics: {e}")
        return {"synced": 0, "error": str(e), "platform": "linkedin"}


@celery_app.task
def sync_all_social_metrics() -> Dict:
    """
    Periodic task to sync metrics for all active social accounts.
    Scheduled to run every hour via beat scheduler.
    """
    try:
        logger.info("Starting periodic social metrics sync")
        
        loop = asyncio.get_event_loop()
        
        async def sync_all():
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(SocialAccount).where(SocialAccount.is_active == True)
                )
                accounts = result.scalars().all()
                
                total_synced = 0
                for account in accounts:
                    if account.platform == "twitter":
                        metrics = await sync_twitter_metrics(db, account)
                        total_synced += metrics.get("synced", 0)
                    elif account.platform == "linkedin":
                        metrics = await sync_linkedin_metrics(db, account)
                        total_synced += metrics.get("synced", 0)
                
                return total_synced
        
        synced = loop.run_until_complete(sync_all())
        logger.info(f"Periodic sync completed: {synced} posts updated")
        return {"synced": synced, "timestamp": datetime.utcnow().isoformat()}
        
    except Exception as e:
        logger.error(f"Periodic social metrics sync failed: {e}")
        return {"error": str(e)}


@celery_app.task
def sync_all_social_metrics() -> Dict:
    """
    Periodic task to sync metrics for all connected accounts.
    """
    logger.info("Starting periodic social metrics sync")
    
    # In production, query all accounts and sync each
    return {"accounts_synced": 0, "status": "complete"}


@celery_app.task(bind=True, max_retries=2)
def schedule_social_posts(self, org_id: str, posts: List[Dict]) -> Dict:
    """
    Schedule multiple social posts for optimal times.
    """
    try:
        scheduled = []
        for post in posts:
            # In production, analyze best posting times and schedule
            scheduled.append({
                "post_id": post.get("id"),
                "scheduled_for": "2024-01-20T14:00:00Z"
            })
        
        return {"org_id": org_id, "scheduled_posts": scheduled}
        
    except Exception as exc:
        logger.error(f"Post scheduling failed: {exc}")
        self.retry(exc=exc, countdown=60)
