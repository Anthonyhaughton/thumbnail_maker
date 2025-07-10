import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambda_python from '@aws-cdk/aws-lambda-python-alpha';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export class ThumbnailMakerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create public Bucket for image upload
    const IngressBucket = new s3.Bucket(this, 'IngressBucket', {
      bucketName: 'haughton-upload-image',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Destory if cdk stack is destroyed
      autoDeleteObjects: true, // Delete objs in bucket
      publicReadAccess: true, // Make Bucket wide open (not good for prod obvi)
      versioned: true, // Enable verisoning
      blockPublicAccess: { // Make Bucket wide open (not good for prod obvi)
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

    // Output Ingress bucket name on cli for ez access
    new cdk.CfnOutput(this, 'IngressBucketName', {
      value: IngressBucket.bucketName
    });

    // Output Egress bucket name on cli for ez access
    new cdk.CfnOutput(this, 'EgressBucketName', {
      value: EgressBucket.bucketName
    });

    // Define the lambda func
    const thumbnailLambda = new lambda_python.PythonFunction(this, 'ThumbnailLambda', {
      entry: 'lambda', // Path to the folder containing the Python code
      runtime: lambda.Runtime.PYTHON_3_11, //3.13 wasnt working for me?
      index: 'handler.py', // The file with the handler function
      handler: 'lambda_handler', // The name of the handler function
      environment: {
        DESTINATION_BUCKET: EgressBucket.bucketName,
      },
    });
      
    // Grant the lambda function read access to the uploads bucket
    IngressBucket.grantRead(thumbnailLambda);

    // Grant the lambda function write access to the processed bucket
    EgressBucket.grantWrite(thumbnailLambda);
    
    // Set s3 trigger
    IngressBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailLambda),
    );
  }
}
