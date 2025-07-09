import * as cdk from 'aws-cdk-lib';
import { S3 } from 'aws-cdk-lib/aws-ses-actions';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ThumbnailMakerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new s3.Bucket(this, 'Bucket', {
      bucketName: 'ingest-image-bucket',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
				blockPublicPolicy: false,
			  ignorePublicAcls: false,
				restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}
