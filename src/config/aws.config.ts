import AWS from 'aws-sdk';
import { config } from './config';

AWS.config.update({ 
    region: config.awsRegion,
    accessKeyId: config.awsAccesskey,
    secretAccessKey: config.awsSecretkey,
});

export { AWS as AWSConfig };