import * as cdk from 'aws-cdk-lib';
import { S3 } from 'aws-cdk-lib/aws-ses-actions';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { version } from 'process';
import { S3Bucket } from 'aws-cdk-lib/aws-kinesisfirehose';

export class ThumbnailMakerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create public Bucket for image upload
    const IngressBucket = new s3.Bucket(this, 'IngressBucket', {
      bucketName: 'haughton-upload-image',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      versioned: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }
    });

    // Create public Bucket for processed images
    const EgressBucket = new s3.Bucket(this, 'EgressBucket', {
      bucketName: 'haughton-processed-image',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      versioned: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }
    });

    // Output Ingress bucket name
    new cdk.CfnOutput(this, 'IngressBucketName', {
      value: IngressBucket.bucketName
    });

    // Output Egress bucket name
    new cdk.CfnOutput(this, 'EgressBucketName', {
      value: EgressBucket.bucketName
    });
  }
}
