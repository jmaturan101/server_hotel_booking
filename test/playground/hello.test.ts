import { handler } from '../../services/HotelsTable/Create';
import { APIGatewayProxyEvent } from 'aws-lambda';

const event: APIGatewayProxyEvent = {
      body: {
          name : 'someName',
          location: 'some location'
      }
} as any;

const result = handler(event, {} as any).then((apiResult)=>{
    const items = JSON.parse(apiResult.body);
    console.log(123)
}); 
