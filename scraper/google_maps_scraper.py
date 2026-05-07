#!/usr/bin/env python3
"""
Google Maps Scraper for LeadFlow AI
Scrapes business listings from Google Maps and uploads to MongoDB

IMPORTANT: This script runs on YOUR LOCAL COMPUTER, not on the server.
Run it periodically to populate your database with fresh leads.

Usage:
    python google_maps_scraper.py --city "Mumbai" --category "Restaurant" --limit 50
"""

import os
import sys
import json
import time
import random
import argparse
from urllib.parse import quote_plus
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

class GoogleMapsScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        })

        # Connect to MongoDB
        mongo_uri = os.getenv('MONGODB_URI')
        if not mongo_uri:
            print("❌ MONGODB_URI not found in .env file")
            sys.exit(1)

        self.client = MongoClient(mongo_uri)
        self.db = self.client.get_database()
        self.leads_collection = self.db.leads

        print("✅ Connected to MongoDB")

    def search_google_maps(self, query, limit=50):
        """Search Google Maps and extract business listings"""
        print(f"\n🔍 Searching: {query}")

        # Google Maps search URL
        search_url = f"https://www.google.com/maps/search/{quote_plus(query)}"

        try:
            response = self.session.get(search_url, timeout=30)
            response.raise_for_status()
        except Exception as e:
            print(f"❌ Failed to fetch: {e}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract business data from script tags (Google Maps embeds data in JS)
        scripts = soup.find_all('script')
        businesses = []

        for script in scripts:
            if script.string and 'window.APP_INITIALIZATION_STATE' in script.string:
                # Parse the embedded data
                try:
                    data = self._extract_from_script(script.string)
                    businesses.extend(data)
                except Exception as e:
                    print(f"⚠️  Error parsing script data: {e}")

        # Fallback: Extract from HTML structure
        if not businesses:
            businesses = self._extract_from_html(soup)

        print(f"📊 Found {len(businesses)} raw listings")
        return businesses[:limit]

    def _extract_from_script(self, script_content):
        """Extract business data from Google Maps script"""
        businesses = []

        # Look for business data patterns
        # This is a simplified parser - real Google Maps obfuscates their data
        # In production, you might need to use Selenium or Playwright

        try:
            # Extract names and basic info using regex patterns
            import re

            # Pattern for business names
            name_pattern = r'"([^"]{3,50})"[^"]*"([\d.]+)\s*stars?"'
            matches = re.findall(name_pattern, script_content)

            for name, rating in matches:
                businesses.append({
                    'name': name,
                    'rating': float(rating) if rating else 0,
                    'source': 'google_maps'
                })
        except Exception as e:
            print(f"⚠️  Script parsing error: {e}")

        return businesses

    def _extract_from_html(self, soup):
        """Fallback: Extract from HTML structure"""
        businesses = []

        # Look for business cards
        cards = soup.find_all('div', {'data-result-index': True})

        for card in cards:
            try:
                name_elem = card.find('div', class_=lambda x: x and 'fontHeadline' in x)
                name = name_elem.text.strip() if name_elem else 'Unknown'

                rating_elem = card.find('span', class_=lambda x: x and 'star' in x.lower())
                rating = 0
                if rating_elem:
                    rating_text = rating_elem.text.strip()
                    try:
                        rating = float(rating_text.split()[0])
                    except:
                        pass

                businesses.append({
                    'name': name,
                    'rating': rating,
                    'source': 'google_maps_html'
                })
            except Exception:
                continue

        return businesses

    def enrich_business_data(self, business, city, category):
        """Enrich business data with additional fields"""
        enriched = {
            'name': business.get('name', 'Unknown Business'),
            'category': category,
            'city': city,
            'area': self._extract_area(business.get('address', '')),
            'address': business.get('address', f'{city}'),
            'phone': business.get('phone', ''),
            'email': '',  # Would need additional scraping
            'website': business.get('website', ''),
            'rating': business.get('rating', 0),
            'score': 0,  # Will be calculated by backend
            'verified': False,
            'source': 'google_maps',
            'metadata': {
                'scraped_at': datetime.utcnow().isoformat(),
                'search_city': city,
                'search_category': category
            }
        }
        return enriched

    def _extract_area(self, address):
        """Extract area/neighborhood from address"""
        if not address:
            return 'Unknown'

        # Simple extraction - can be improved
        parts = address.split(',')
        if len(parts) >= 2:
            return parts[-2].strip()
        return parts[0].strip() if parts else 'Unknown'

    def save_to_database(self, leads):
        """Save leads to MongoDB, avoiding duplicates"""
        if not leads:
            print("⚠️  No leads to save")
            return 0

        inserted = 0
        skipped = 0

        for lead in leads:
            # Check for duplicates by name + city + category
            existing = self.leads_collection.find_one({
                'name': lead['name'],
                'city': lead['city'],
                'category': lead['category']
            })

            if existing:
                skipped += 1
                continue

            try:
                self.leads_collection.insert_one(lead)
                inserted += 1
            except Exception as e:
                print(f"⚠️  Error inserting lead: {e}")

        print(f"✅ Inserted: {inserted} | ⏭️  Skipped (duplicates): {skipped}")
        return inserted

    def upload_to_api(self, leads):
        """Upload leads to backend API (alternative to direct DB insert)"""
        api_url = os.getenv('API_BASE_URL')
        admin_token = os.getenv('ADMIN_TOKEN')

        if not api_url or not admin_token:
            print("⚠️  API credentials not found, skipping API upload")
            return

        headers = {
            'Authorization': f'Bearer {admin_token}',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(
                f"{api_url}/leads/bulk",
                json={ 'leads': leads },
                headers=headers,
                timeout=30
            )

            if response.status_code == 201:
                data = response.json()
                print(f"✅ API Upload: {data.get('count', 0)} leads created")
            else:
                print(f"⚠️  API upload failed: {response.status_code}")
        except Exception as e:
            print(f"⚠️  API upload error: {e}")

    def scrape(self, city, category, limit=50, upload_api=False):
        """Main scraping workflow"""
        query = f"{category} in {city}"

        print("=" * 60)
        print(f"🚀 Starting scrape: {query}")
        print("=" * 60)

        # Search and extract
        raw_businesses = self.search_google_maps(query, limit)

        if not raw_businesses:
            print("❌ No businesses found")
            return

        # Enrich data
        print("\n🔄 Enriching business data...")
        enriched_leads = []
        for biz in tqdm(raw_businesses, desc="Processing"):
            lead = self.enrich_business_data(biz, city, category)
            enriched_leads.append(lead)
            time.sleep(random.uniform(0.1, 0.3))  # Be polite

        # Save to database
        print("\n💾 Saving to database...")
        inserted = self.save_to_database(enriched_leads)

        # Optionally upload via API
        if upload_api:
            self.upload_to_api(enriched_leads)

        print(f"\n🎉 Scraping complete! {inserted} new leads added.")
        print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Google Maps Lead Scraper')
    parser.add_argument('--city', required=True, help='City to search in')
    parser.add_argument('--category', required=True, help='Business category')
    parser.add_argument('--limit', type=int, default=50, help='Max results (default: 50)')
    parser.add_argument('--api', action='store_true', help='Upload via API instead of direct DB')

    args = parser.parse_args()

    scraper = GoogleMapsScraper()
    scraper.scrape(args.city, args.category, args.limit, args.api)


if __name__ == '__main__':
    main()
