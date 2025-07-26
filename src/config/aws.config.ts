import AWS from 'aws-sdk';
import { config } from './config';

AWS.config.update({ region: config.awsRegion });

export { AWS as AWSConfig };