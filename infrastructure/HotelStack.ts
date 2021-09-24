import {Stack, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { join } from 'path' ;
import { AuthorizationType, LambdaIntegration, MethodOptions ,RestApi } from 'aws-cdk-lib/lib/aws-apigateway'
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/lib/aws-iam';
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';


export class HotelStack extends Stack {

    private api = new RestApi(this, 'HotelApi');
    private authorizer: AuthorizerWrapper;

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

        this.authorizer = new AuthorizerWrapper(this, this.api);

        const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
            entry: (join(__dirname, '..', 'services', 'node-lambda', 'hello.ts')),
            handler: 'handler'
        });
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions('s3:ListAllMyBuckets');
        s3ListPolicy.addResources('*')
        helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

        const optionsWithAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }


     // Hello Api lambda integration:
     const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs)
     const helloLambdaResource = this.api.root.addResource('hello');
     helloLambdaResource.addMethod('GET', helloLambdaIntegration, optionsWithAuthorizer);

     //Hotels API integrations:
     const hotelResource = this.api.root.addResource('hotels');
     hotelResource.addMethod('POST', this.hotelsTable.createLambdaIntegration);
     hotelResource.addMethod('GET', this.hotelsTable.readLambdaIntegration);
     hotelResource.addMethod('PUT', this.hotelsTable.updateLambdaIntegration);
     hotelResource.addMethod('DELETE', this.hotelsTable.deleteLambdaIntegration);

    }

    
} 