import os

import boto3
from dotenv import load_dotenv


load_dotenv()


DYNAMODB_REGION = os.getenv("AWS_REGION", "ap-south-1")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "PhishShieldScans")


dynamodb = boto3.resource(
    "dynamodb",
    region_name=DYNAMODB_REGION
)


def get_db_connection():
    return dynamodb.Table(DYNAMODB_TABLE)