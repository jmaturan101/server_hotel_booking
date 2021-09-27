import { CfnOutput, Stack } from "aws-cdk-lib";
import { CloudFrontWebDistribution } from "aws-cdk-lib/lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/lib/aws-s3-deployment";
import { join } from 'path';

export class WebAppDeployment {

    private stack: Stack;
    private bucketSuffix: string;
    private deploymentBucket: Bucket

    constructor(stack: Stack, bucketSuffix: string){
        this.stack = stack;
        this.bucketSuffix = bucketSuffix;
        this.initialize();
    }

    private initialize(){
        const bucketName = 'hotel-app-web' + this.bucketSuffix;
        this.deploymentBucket = new Bucket(
            this.stack,
            'hotel-app-web-id', {
                bucketName: bucketName,
                publicReadAccess: true,
                websiteIndexDocument: 'index.html'
            }
        );
        new BucketDeployment(
            this.stack,
            'hotel-app-web-id-deployment', {
                destinationBucket: this.deploymentBucket,
                sources: [
                    Source.asset(
                        join(__dirname, '..', '..', 'client_hotel_booking', 'build')
                    )
                ]
            }
        );
        new CfnOutput(this.stack, 'hotelFinderWebAppS3Url', {
            value: this.deploymentBucket.bucketWebsiteUrl
        });

        const cloudFront = new CloudFrontWebDistribution(
            this.stack,
            'hotel-app-web-distribution', {
                originConfigs:[
                    {
                        behaviors: [
                            {
                                isDefaultBehavior: true
                            }
                        ],
                        s3OriginSource: {
                            s3BucketSource: this.deploymentBucket
                        }
                    }
                ]
            }
        );
        new CfnOutput(this.stack, 'hotelFinderWebAppCloudFrontUrl', {
            value: cloudFront.distributionDomainName
        });

    }

}
