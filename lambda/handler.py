from PIL import Image
import boto3
import io
import os
import urllib
import time

s3_client = boto3.client('s3')
DESTINATION_BUCKET = os.environ.get('DESTINATION_BUCKET')

def lambda_handler(event, context):
    # Get source bucket and key (filename) from triggering event
    source_bucket = event['Records'][0]['s3']['bucket']['name']
    key_from_event = event['Records'][0]['s3']['object']['key']
    source_key = urllib.parse.unquote_plus(key_from_event) # use parsing module just incase the file is janky or has spaces
    
    # retry loop to get_object from s3 bucket
    response = None
    for _ in range(3): # Try 3 times
        try:
            response = s3_client.get_object(Bucket=source_bucket, Key=source_key)
            break # Success, exit the loop
        except s3_client.exceptions.NoSuchKey:
            print(f"Waiting for object {source_key} to be available...")
            time.sleep(1) # Wait for 1 second

    if not response:
        print(f"ERROR: Object {source_key} not found after retries.")
        raise # Re-raise the last exception if all retries fail
    image_content = response['Body'].read()
    
    # Open the image with Pillow and resize
    image = Image.open(io.BytesIO(image_content))
    image.thumbnail((256, 256)), Image.Resampling.LANCZOS # Use updated resampling filter
    
    # Save resized image to an in-memory buffer
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0) # Rewind buffer to the beginning
    
    # Upload the buffers content to the dest bucket
    # Create a new name for the thumbnail
    
    destination_key = f'thumb-{source_key}'
    s3_client.put_object(Bucket=DESTINATION_BUCKET, Key=destination_key, Body=buffer)
    
    return {'status': 'ok', 'message': f'Successful resized {source_key} and uploaded to {destination_key}'}
