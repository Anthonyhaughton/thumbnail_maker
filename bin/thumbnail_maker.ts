#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ThumbnailMakerStack } from '../lib/thumbnail_maker-stack';

const app = new cdk.App();
new ThumbnailMakerStack(app, 'ThumbnailMakerStack', {
  /* Pass bucket names */
  IngressBucket: 'haughton-upload-bucket',
  EgressBucket: 'haughton-processed-bucket',
});