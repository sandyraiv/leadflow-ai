#!/usr/bin/env python3
"""
Bulk Lead Uploader for LeadFlow AI
Upload leads from CSV/Excel files to the database

Usage:
    python bulk_upload.py --file leads.csv --city "Mumbai" --category "Restaurant"
"""

import os
import sys
import argparse
import pandas as pd
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


def calculate_score(lead):
    """Calculate lead score (mirror of backend logic)"""
    score = 10  # Base for name

    if lead.get('phone') and len(str(lead.get('phone', ''))) > 5:
        score += 15
    if lead.get('email') and '@' in str(lead.get('email', '')):
        score += 15
    if lead.get('website') and '.' in str(lead.get('website', '')):
        score += 10
    if lead.get('city'):
        score += 10
    if lead.get('area'):
        score += 5
    if lead.get('address') and len(str(lead.get('address', ''))) > 10:
        score += 5
    if lead.get('rating') and float(lead.get('rating', 0)) > 0:
        score += min(float(lead.get('rating', 0)) * 3, 15)
    if lead.get('category') and lead.get('category') != 'Other':
        score += 10

    return min(score, 100)


def process_csv(file_path, city, category):
    """Process CSV/Excel file and return formatted leads"""
    print(f"📁 Reading file: {file_path}")

    # Detect file type
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file_path.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(file_path)
    else:
        print("❌ Unsupported file format. Use .csv or .xlsx")
        sys.exit(1)

    print(f"📊 Found {len(df)} rows")

    # Map common column names
    column_mapping = {
        'name': ['name', 'business_name', 'company', 'title', 'business name', 'company name'],
        'phone': ['phone', 'mobile', 'contact', 'phone_number', 'telephone', 'phone number'],
        'email': ['email', 'e-mail', 'mail', 'email_id'],
        'website': ['website', 'site', 'url', 'web', 'webpage'],
        'address': ['address', 'location', 'full_address', 'street'],
        'area': ['area', 'locality', 'neighborhood', 'sector'],
        'rating': ['rating', 'stars', 'review', 'score'],
        'category': ['category', 'type', 'business_type', 'industry']
    }

    # Find actual columns in file
    actual_columns = {}
    df_columns_lower = [c.lower().strip() for c in df.columns]

    for standard, variants in column_mapping.items():
        for variant in variants:
            if variant in df_columns_lower:
                idx = df_columns_lower.index(variant)
                actual_columns[standard] = df.columns[idx]
                break

    print(f"📋 Mapped columns: {list(actual_columns.keys())}")

    leads = []
    for _, row in df.iterrows():
        lead = {
            'name': str(row.get(actual_columns.get('name', 'name'), 'Unknown Business')).strip(),
            'category': category or str(row.get(actual_columns.get('category', 'category'), 'Other')).strip(),
            'city': city or str(row.get(actual_columns.get('city', 'city'), 'Unknown')).strip(),
            'area': str(row.get(actual_columns.get('area', 'area'), '')).strip(),
            'address': str(row.get(actual_columns.get('address', 'address'), '')).strip(),
            'phone': str(row.get(actual_columns.get('phone', 'phone'), '')).strip(),
            'email': str(row.get(actual_columns.get('email', 'email'), '')).strip(),
            'website': str(row.get(actual_columns.get('website', 'website'), '')).strip(),
            'rating': float(row.get(actual_columns.get('rating', 'rating'), 0)) if pd.notna(row.get(actual_columns.get('rating', 'rating'), 0)) else 0,
            'verified': False,
            'source': 'bulk_upload',
            'metadata': {
                'uploaded_at': datetime.utcnow().isoformat(),
                'original_file': os.path.basename(file_path)
            }
        }

        # Calculate score
        lead['score'] = calculate_score(lead)

        # Skip empty names
        if lead['name'] and lead['name'] != 'nan':
            leads.append(lead)

    print(f"✅ Processed {len(leads)} valid leads")
    return leads


def upload_to_mongodb(leads):
    """Upload leads to MongoDB"""
    mongo_uri = os.getenv('MONGODB_URI')
    if not mongo_uri:
        print("❌ MONGODB_URI not found in .env")
        sys.exit(1)

    client = MongoClient(mongo_uri)
    db = client.get_database()
    collection = db.leads

    inserted = 0
    skipped = 0

    print("\n💾 Uploading to MongoDB...")

    for lead in leads:
        # Check duplicates
        existing = collection.find_one({
            'name': lead['name'],
            'city': lead['city'],
            'category': lead['category']
        })

        if existing:
            skipped += 1
            continue

        try:
            collection.insert_one(lead)
            inserted += 1
        except Exception as e:
            print(f"⚠️  Error: {e}")

    print(f"\n✅ Inserted: {inserted} | ⏭️  Skipped: {skipped}")
    client.close()


def main():
    parser = argparse.ArgumentParser(description='Bulk Lead Uploader')
    parser.add_argument('--file', required=True, help='Path to CSV/Excel file')
    parser.add_argument('--city', default='', help='Default city (if not in file)')
    parser.add_argument('--category', default='', help='Default category (if not in file)')

    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"❌ File not found: {args.file}")
        sys.exit(1)

    leads = process_csv(args.file, args.city, args.category)

    if leads:
        upload_to_mongodb(leads)
        print(f"\n🎉 Upload complete! {len(leads)} leads processed.")
    else:
        print("\n⚠️  No valid leads found in file.")


if __name__ == '__main__':
    main()
