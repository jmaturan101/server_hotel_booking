import { CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { join } from 'path' ;
import { AuthorizationType, LambdaIntegration, MethodOptions ,RestApi } from 'aws-cdk-lib/lib/aws-apigateway'
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/lib/aws-iam';
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';
import { Bucket, HttpMethods } from 'aws-cdk-lib/lib/aws-s3';
import { WebAppDeployment } from './WebAppDeployment';

export class HotelStack extends Stack {

    private api = new RestApi(this, 'HotelApi');
    private authorizer: AuthorizerWrapper;
    private suffix: string;
    private hotelsPhotosBucket : Bucket;

    private hotelsTable = new GenericTable(this,{
        tableName: 'hotelsTable',
        primaryKey: 'hotelId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        updateLambdaPath: 'Update',
        deleteLambdaPath: 'Delete',
        secondaryIndexes: ['location']

    } )

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        this.initializeSuffix();
        this.initializeHotelsPhotosBucket();
        this.authorizer = new AuthorizerWrapper(
            this, 
            this.api,
            this.hotelsPhotosBucket.bucketArn + '/*'
            );

            new WebAppDeployment(this, this.suffix);


        const optionsWithAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }

     //Hotels API integrations:
     const hotelResource = this.api.root.addResource('hotels');
     hotelResource.addMethod('POST', this.hotelsTable.createLambdaIntegration);
     hotelResource.addMethod('GET', this.hotelsTable.readLambdaIntegration);
     hotelResource.addMethod('PUT', this.hotelsTable.updateLambdaIntegration);
     hotelResource.addMethod('DELETE', this.hotelsTable.deleteLambdaIntegration);

    }

    private initializeSuffix(){
        const shortStackId = Fn.select(2, Fn.split('/', this.stackId));
        const Suffix = Fn.select(4, Fn.split('-', shortStackId));
        this.suffix = Suffix;
    }
    private initializeHotelsPhotosBucket(){
        this.hotelsPhotosBucket = new Bucket(this, 'hotels-photos', {
            bucketName: 'hotels-photos-' + this.suffix,
            cors: [{
                allowedMethods:[
                    HttpMethods.HEAD,
                    HttpMethods.GET,
                    HttpMethods.PUT
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*']
            }]
        });
        new CfnOutput(this, 'hotels-photos-bucket-name', {
            value: this.hotelsPhotosBucket.bucketName
        })
    }



    
} 